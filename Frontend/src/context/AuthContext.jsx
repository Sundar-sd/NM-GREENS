import { createContext, useContext, useState } from "react";
import { SAMPLE_USERS } from "../utils/mockData";

const AuthContext = createContext();

function getUsers() {
  try {
    const raw = localStorage.getItem("nm_users");
    if (!raw) { localStorage.setItem("nm_users", JSON.stringify(SAMPLE_USERS)); return SAMPLE_USERS; }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) { localStorage.setItem("nm_users", JSON.stringify(SAMPLE_USERS)); return SAMPLE_USERS; }
    const merged = SAMPLE_USERS.map((su) => {
      const existing = parsed.find((u) => u._id === su._id);
      return existing ? { ...existing, ...su, password: existing.password } : su;
    });
    parsed.forEach((u) => {
      if (!merged.find((m) => m._id === u._id)) merged.push(u);
    });
    localStorage.setItem("nm_users", JSON.stringify(merged));
    return merged;
  } catch { localStorage.setItem("nm_users", JSON.stringify(SAMPLE_USERS)); return SAMPLE_USERS; }
}

function saveUsers(users) {
  localStorage.setItem("nm_users", JSON.stringify(users));
}

function updateUserInStorage(updatedUser) {
  const userData = { ...updatedUser };
  delete userData.password;
  localStorage.setItem("nm_user", JSON.stringify(userData));
  const users = getUsers();
  const idx = users.findIndex((u) => u._id === updatedUser._id);
  if (idx > -1) {
    users[idx].vaultBalance = updatedUser.vaultBalance;
    saveUsers(users);
  }
  return userData;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("nm_user");
    return stored ? JSON.parse(stored) : null;
  });

  function login(email, password) {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid email or password");
    if (found.status === "suspended") throw new Error("Account suspended");
    const token = "mock_token_" + found._id;
    const userData = { ...found };
    delete userData.password;
    localStorage.setItem("nm_token", token);
    localStorage.setItem("nm_user", JSON.stringify(userData));
    setUser(userData);
    return { user: userData };
  }

  function register(data) {
    const users = getUsers();
    const exists = users.find((u) => u.email === data.email);
    if (exists) throw new Error("Email already registered");
    const newUser = {
      _id: "u" + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: "customer",
      status: "active",
      vaultBalance: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const token = "mock_token_" + newUser._id;
    const userData = { ...newUser };
    delete userData.password;
    localStorage.setItem("nm_token", token);
    localStorage.setItem("nm_user", JSON.stringify(userData));
    setUser(userData);
    return { user: userData };
  }

  function logout() {
    localStorage.removeItem("nm_token");
    localStorage.removeItem("nm_user");
    setUser(null);
  }

  function addToVault(amount) {
    if (!user) return;
    const updated = { ...user, vaultBalance: (user.vaultBalance || 0) + amount };
    const userData = updateUserInStorage(updated);
    setUser(userData);
    return userData;
  }

  function deductFromVault(amount) {
    if (!user) return;
    const current = user.vaultBalance || 0;
    if (Math.round(current * 100) / 100 < Math.round(amount * 100) / 100) throw new Error("Insufficient vault balance");
    const updated = { ...user, vaultBalance: current - amount };
    const userData = updateUserInStorage(updated);
    setUser(userData);
    return userData;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, addToVault, deductFromVault }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


