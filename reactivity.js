const pendingHandlers = [];
const globalPendingEvents = new Map();
const nextTickMs = 10;

function commonGet(handler) {
  if (handler) {
    this._changeHandlers.push(handler);
    handler();
  }
}

function throttleEventTrigger(delay) {
  let timeout;
  const timeoutFn = () => {
    let i = 0;
    let temp;
    for (const event in globalPendingEvents) {
      const [eventFn, thisArgs] = globalPendingEvents[event];
      eventFn.apply(thisArgs, [pendingHandlers[i]]);
      temp = pendingHandlers[i];
      i++;
    }
    globalPendingEvents.clear();
    pendingHandlers.length = 0;
  };

  function throttledFunc(e, thisArgs) {
    if (currentHandler) {
      globalPendingEvents[currentHandler] = [commonGet, thisArgs];
    }
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFn, delay);
  }

  return throttledFunc;
}

const fireChangeEvent = throttleEventTrigger();

class Dep {
  _changeHandlers = [];
  #value;

  constructor(initialValue) {
    this.#value = initialValue;
  }

  set value(newValue) {
    if (newValue !== this.#value) {
      this.#value = newValue;
      this._changeHandlers.forEach((handler) => handler());
    }
  }

  get value() {
    fireChangeEvent(commonGet, this);
    return this.#value;
  }
}

class ReactiveDep {
  constructor(initialValue) {
    const proxy = new Proxy(initialValue, {
      get: this.get,
      set: this.set,
      has: this.has,
      ownKeys: this.ownKeys,
      deleteProperty: this.deleteProperty,
      _changeHandlers: [],
      _uniqueHandlers: new WeakSet(),
    });
    return proxy;
  }

  get(target, key, receiver) {
    fireChangeEvent(commonGet, this);
    return Reflect.get(target, key, receiver);
  }

  set(target, key, value, receiver) {
    const retVal = Reflect.set(target, key, value, receiver);
    this._changeHandlers.forEach((handler) => handler());
    return retVal;
  }

  has(target, key) {
    fireChangeEvent(commonGet, this);
    return Reflect.has(target, key);
  }

  ownKeys(target) {
    fireChangeEvent(commonGet, this);
    return Reflect.ownKeys(target);
  }

  deleteProperty(target, property) {
    this._changeHandlers.forEach((handler) => handler());
    return Reflect.deleteProperty(target, property);
  }
}

function ref(initialValue) {
  const dep = new Dep(initialValue);
  return dep;
}

function watchEffect(handler) {
  currentHandler = handler;
  pendingHandlers.push(handler);
  handler();
  return handler;
}

function reactive(initialValue) {
  return new ReactiveDep(initialValue);
}
