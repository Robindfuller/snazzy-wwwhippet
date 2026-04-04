// Netscape throbber animation controller
const Throbber = {
  element: null,

  init() {
    this.element = document.getElementById('throbber');
  },

  start() {
    if (this.element) {
      this.element.classList.add('loading');
    }
  },

  stop() {
    if (this.element) {
      this.element.classList.remove('loading');
    }
  },
};
