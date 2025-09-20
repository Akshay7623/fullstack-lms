const setPagination = (name, size)=> localStorage.setItem(name, size);
const getPagination = (name)=>localStorage.getItem(name)

export { setPagination, getPagination };