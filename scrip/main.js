const myLibrary = [];

const Book = (function () {
  function Book(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.author = data.author;
    this.date = new Date(data.date);
    this.pages = data.pages;
    this.read = data.read === undefined ? false : data.read;
  }

  Book.prototype.render = function () {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', this.id);

    Object.keys(this).forEach((key) => {
      tr.append(this.renderAttribute(key));
    });

    return tr;
  };

  Book.prototype.renderAttribute = function (attribute) {
    const td = document.createElement('td');
    td.setAttribute('data-attr', attribute);

    const text = Book.formatters(attribute).format(this);
    const classes = Book.formatters(attribute).classList(this);
    if (classes) {
      td.classList.add(classes);
    }
    td.innerHTML = text;

    return td;
  };

  Book.formatters = function (attribute) {
    const def = {
      format: (book) => book[attribute],
      classList: () => '',
    };

    const formatters = {
      date: {
        format: (book) => book.date.toISOString().split('T')[0],
      },
      read: {
        classList: (book) => (book.isRead() ? 'green' : 'red'),
        format: (book) => (book.isRead() ? '&check;' : '&times;'),
      },
    };

    return { ...def, ...formatters[attribute] };
  };

  Book.prototype.toggle = function () {
    this.read = !this.read;
  };

  Book.prototype.save = function () {
    if (typeof this.id === 'undefined') {
      const keys = Object.keys(Book.all()).concat([0]);
      this.id = Math.max(...keys) + 1;
    }
    Book.all()[this.id] = this.literal();
  };

  Book.prototype.destroy = function () {
    delete Book.all()[this.id];
  };

  Book.prototype.isRead = function () {
    return this.read;
  };

  Book.prototype.literal = function () {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      date: this.date.toISOString().split('T')[0],
      pages: this.pages,
      read: this.read,
    };
  };

  Book.find = function (id) {
    const book = Book.all()[id];
    if (book) {
      return Book.hydrate(book);
    }
    return undefined;
  };

  Book.hydrate = function (book) {
    return new Book(book);
  };

  Book.all = function () {
    const books = window.books || (window.books = {});
    Object.keys(books).forEach((key) => {
      books[key] = Book.hydrate(books[key]);
    });
    return books;
  };

  Book.destroy = function (id) {
    delete Book.all()[id];
  };

  Book.toArray = function () {
    return Object.values(Book.all());
  };

  return Book;
}());

function render() {
  const body = document.getElementById('body');
  body.innerHTML = '';
  myLibrary.map(e => e.toString());
  Book.toArray().forEach((book) => {
    const tr = book.render();
    const td = document.createElement('td');
    const remove = document.createElement('a');
    remove.addEventListener('click', (e) => {
      e.preventDefault();
      book.destroy();
      render();
    });
    remove.innerHTML = 'Remove';

    const toggle = document.createElement('a');
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      book.toggle();
      book.save();
      render();
    });
    toggle.innerHTML = 'Toggle';

    td.append(remove);
    td.appendChild(document.createTextNode(' | '));
    td.append(toggle);

    tr.append(td);
    body.append(tr);
  });
}

function addBooktoLibrary(data) {
  new Book(data).save();
}

const form = document.querySelector('.form');
form.onsubmit = (e) => {
  e.preventDefault();

  const {
    title,
    author,
    date,
    pages,
  } = e.target.elements;

  addBooktoLibrary({
    title: title.value,
    author: author.value,
    date: date.value,
    pages: pages.value,
  });

  e.target.reset();

  render();
};

render();
