const prefixkey = '@cifraIntranet/'

export const setStorageItem = (key, value) => {
    localStorage.setItem(`${prefixkey}${key}`, value)
}

export const getStorageItem = (key) => {
    return localStorage.getItem(`${prefixkey}${key}`)
}

export const removeStorageItem = (key) => {
    localStorage.removeItem(`${prefixkey}${key}`)
}