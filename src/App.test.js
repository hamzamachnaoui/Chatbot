import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { onAuthStateChanged } from "firebase/auth";
import { formatUsernameToEmail } from "./contexts/AuthContext";
import { formatMessageDateHeader, formatMessageTime } from "./utils/formatters";
import {
  getPrivateChatId,
  getOtherParticipantUid,
  isValidPrivateChatIdForUser,
} from "./utils/privateChat";
import App from "./App";

global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock(
  "react-router-dom",
  () => ({
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => {
      const mockReact = require("react");
      const routes = mockReact.Children.toArray(children);
      const homeRoute = routes.find((child) => child.props?.path === "/");
      return homeRoute ? homeRoute.props.element : null;
    },
    Route: ({ element }) => element,
    Navigate: () => null,
    useNavigate: () => jest.fn(),
    useParams: () => ({ roomId: "Général" }),
  }),
  { virtual: true }
);

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInAnonymously: jest.fn(),
  updateProfile: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteField: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
}));

beforeEach(() => {
  onAuthStateChanged.mockImplementation((_auth, cb) => {
    cb(null);
    return jest.fn();
  });
});

describe("Auth & formatting helpers", () => {
  test("formatUsernameToEmail normalizes accents and spaces", () => {
    expect(formatUsernameToEmail("Élève Test")).toBe("eleve_test@chat.com");
    expect(formatUsernameToEmail("user@example.com")).toBe("user@example.com");
    expect(formatUsernameToEmail("")).toBe("");
  });

  test("formatMessageDateHeader identifies today and yesterday", () => {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    expect(formatMessageDateHeader(now)).toBe("Aujourd'hui");
    expect(formatMessageDateHeader(yesterday)).toBe("Hier");
    expect(formatMessageDateHeader(null)).toBe("");
  });

  test("formatMessageTime handles Date and invalid values", () => {
    expect(formatMessageTime(new Date("2026-01-01T14:30:00"))).toMatch(/14[:h]30/);
    expect(formatMessageTime(null)).toBe("");
  });

  test("private chat helpers build deterministic symmetric IDs and validate participants", () => {
    const idAB = getPrivateChatId("userA", "userB");
    const idBA = getPrivateChatId("userB", "userA");

    expect(idAB).toBe("userA__userB");
    expect(idAB).toBe(idBA);
    expect(getPrivateChatId("userA", "userA")).toBe("");

    expect(getOtherParticipantUid(idAB, "userA")).toBe("userB");
    expect(getOtherParticipantUid(idAB, "userB")).toBe("userA");
    expect(getOtherParticipantUid(idAB, "userC")).toBe("");

    expect(isValidPrivateChatIdForUser(idAB, "userA")).toBe(true);
    expect(isValidPrivateChatIdForUser(idAB, "userC")).toBe(false);
  });
});

test("renders login screen when unauthenticated", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<App />);
  });

  expect(container.textContent).toContain("Connexion");
  expect(container.textContent).toContain("Accès direct en tant qu'invité");

  act(() => {
    root.unmount();
  });
  container.remove();
});
