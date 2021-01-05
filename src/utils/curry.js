function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length
      ? fn.apply(this, args)
      : (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  }
}

export default curry;
