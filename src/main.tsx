import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { IndexedDbConnector } from "./db/IndexedDbConnector.tsx";
import { DatabaseProvider } from "./db/Database.tsx";

const connector = new IndexedDbConnector({
  name: "movie-rating-machine",
  version: 1,
  stores: [
    {
      name: "movies",
      options: { keyPath: "id", autoIncrement: true },
      indexes: [
        { name: "by_title", keyPath: "title" },
        { name: "by_rating", keyPath: "rating" },
      ],
    },
  ],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DatabaseProvider connector={connector}>
      <App />
    </DatabaseProvider>
  </StrictMode>,
);
