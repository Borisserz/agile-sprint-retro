// ПЗ3: имитация авторизации для PrivateRoute (localStorage)
const KEY = 'pz23_isAuth';

export function isAuth() {
  return localStorage.getItem(KEY) === '1';
}

export function login() {
  localStorage.setItem(KEY, '1');
}

export function logout() {
  localStorage.removeItem(KEY);
}
