// element DOM
const bookForm = document.getElementById("bookForm");
const searchForm = document.getElementById("searchBook");
const incompleteBookshelfList = document.getElementById("incompleteBookList");
const completeBookshelfList = document.getElementById("completeBookList");
const bookFormIsComplete = document.getElementById("bookFormIsComplete");
const bookFormSubmitButton = document.getElementById("bookFormSubmit");
const searchBookTitle = document.getElementById("searchBookTitle");
const bookFormTitle = document.getElementById("bookFormTitle");
const bookFormAuthor = document.getElementById("bookFormAuthor");
const bookFormYear = document.getElementById("bookFormYear");

// initiate dan defined
let books = [];
let editingBookId = null;

const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const SEARCH_EVENT = "search-book";

// load data saat web dibuka
document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener(RENDER_EVENT, function () {
    renderBooks(books);
  });

  if (isStorageAvailable()) {
    loadDataFromStorage();
  }

  // event listener untuk form dan button
  bookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
  });

  bookFormIsComplete.addEventListener("change", function () {
    updateSubmitButtonText();
  });

  updateSubmitButtonText();
});

// fungsi untuk validasi apakah localstorage ada
function isStorageAvailable() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

// fungsi untuk load data dari storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  if (serializedData) {
    const data = JSON.parse(serializedData);

    if (data !== null) {
      books = [];
      for (const book of data) {
        books.push(book);
      }
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// fungsi untuk menyimpan data ke local
function saveData() {
  if (isStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// fungsi untuk button update submit
function updateSubmitButtonText() {
  const buttonSpan = bookFormSubmitButton.querySelector("span");
  if (bookFormIsComplete.checked) {
    buttonSpan.innerText = "selesai dibaca";
  } else {
    buttonSpan.innerText = "belum selesai dibaca";
  }
}

// fungsi membuat ID unik sesuai tanggal
function generateId() {
  return +new Date();
}

// fungsi untuk menambah atau mengubah buku
function addBook() {
  const title = bookFormTitle.value;
  const author = bookFormAuthor.value;
  const year = parseInt(bookFormYear.value);
  const isComplete = bookFormIsComplete.checked;

  const id = editingBookId || generateId();
  const bookObject = generateBookObject(id, title, author, year, isComplete);

  if (editingBookId) {
    const index = books.findIndex((book) => book.id === editingBookId);
    if (index !== -1) {
      books[index] = bookObject;
      editingBookId = null;

      // mereset teks dari tombol form
      bookFormSubmitButton.innerText = "Masukkan buku ke rak ";
      const buttonSpan = document.createElement("span");
      buttonSpan.innerText = isComplete
        ? "Selesai dibaca"
        : "Belum selesai dibaca";
      bookFormSubmitButton.appendChild(buttonSpan);
    }
  } else {
    // masuk buku baru
    books.push(bookObject);
  }

  // menyimpan dan render ulang data
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
  resetForm();
}

// fungsi membuat objek dari buku
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// fungsi untuk reset form
function resetForm() {
  bookFormTitle.value = "";
  bookFormAuthor.value = "";
  bookFormYear.value = "";
  bookFormIsComplete.checked = false;
  editingBookId = null;
  updateSubmitButtonText();
}

// fungsi untuk membuat elemen buku
function createBookElement(book) {
  // bikin div isi buku
  const bookContainer = document.createElement("div");
  bookContainer.setAttribute("data-bookid", book.id);
  bookContainer.setAttribute("data-testid", "bookItem");

  // bikin elemen judul buku
  const bookTitle = document.createElement("h3");
  bookTitle.setAttribute("data-testid", "bookItemTitle");
  bookTitle.innerText = book.title;

  // bikin elemen penulis buku
  const bookAuthor = document.createElement("p");
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");
  bookAuthor.innerText = `Penulis: ${book.author}`;

  //   bikin elemen tahun buku
  const bookYear = document.createElement("p");
  bookYear.setAttribute("data-testid", "bookItemYear");
  bookYear.innerText = `Tahun: ${book.year}`;

  // membuat div untuk tombol pada tampilan buku
  const buttonContainer = document.createElement("div");

  // tombol untuk mengubah status buku (selesai)
  const toggleButton = document.createElement("button");
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  toggleButton.innerText = book.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  toggleButton.addEventListener("click", function () {
    toggleBookStatus(book.id);
  });

  // tombol untuk menghapus buku
  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerText = "Hapus buku";
  deleteButton.addEventListener("click", function () {
    deleteBook(book.id);
  });

  // tombol untuk mengedit buku
  const editButton = document.createElement("button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerText = "Edit Buku";
  editButton.addEventListener("click", function () {
    editBook(book.id);
  });

  // masukkan semua tombol ke div
  buttonContainer.append(toggleButton, editButton, deleteButton);

  bookContainer.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  return bookContainer;
}

// fungsi untuk hapus buku
function deleteBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex !== -1) {
    if (confirm("Apakah anda benar ingin menghapus buku ini dari rak Anda?")) {
      books.splice(bookIndex, 1);

      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  }
}

// fungsi untuk edit buku
function editBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex !== -1) {
    const book = books[bookIndex];

    bookFormTitle.value = book.title;
    bookFormAuthor.value = book.author;
    bookFormYear.value = book.year;
    bookFormIsComplete.checked = book.isComplete;

    editingBookId = book.id;
    bookFormSubmitButton.innerText = "Edit buku";

    bookForm.scrollIntoView({ behavior: "smooth" });
  }
}

// fungsi untuk mencari buku
function searchBook() {
  const searchThing = searchBookTitle.value.toLowerCase();

  if (searchThing) {
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(searchThing)
    );
    renderBooks(filteredBooks);
  } else {
    renderBooks(books);
  }
}

// fungsi untuk merender buku buku
function renderBooks(booksToRender) {
  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  for (const book of booksToRender) {
    const bookElement = createBookElement(book);

    if (book.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
}

// fungsi untuk status buku
function toggleBookStatus(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}
