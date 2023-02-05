import React from "react";
import _Editor from "@monaco-editor/react";

const Editor = Object.hasOwnProperty.call(_Editor, "default")
  ? (_Editor as any).default
  : _Editor;

import { toast, Toaster } from "react-hot-toast";
interface Lang {
  languageId: string;
  confidence: number;
}

const themePrefix = "vs-";
console.log(import.meta.env);

function App() {
  const API_URL = import.meta.env.DEV ? "http://localhost:3004" : window.location.origin;

  const [code, setCode] = React.useState("");
  const [lang, setLang] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const theme = localStorage.getItem("dark") === "true" ? "dark" : "light";
  const themeName = themePrefix + theme;

  const detectLang = async (value: string) => {
    // @ts-ignore
    if (!window.GuessLang) {
      return;
    }

    // @ts-ignore
    const g = new GuessLang();
    const langs = await g.runModel(value);
    if (!langs || langs.length === 0) {
      return;
    }

    const lang = langs.reduce((a: Lang, b: Lang) =>
      a.confidence > b.confidence ? a : b
    );

    setLang(lang.languageId);
  };

  const onChange = React.useCallback(async (value?: string) => {
    setCode(value || "");
  }, []);

  const submit = async () => {
    setLoading(true);

    try {
      const r = await fetch(`${API_URL}/newCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
        }),
      }).then((res) => res.json());

      const prevCodes = JSON.parse(localStorage.getItem("codes") || "[]");
      let newCodes = [...prevCodes, r];
      // remove duplicates
      newCodes = newCodes.filter(
        (v: { hash: string }, i: number, a: { hash: string }[]) =>
          a.findIndex((t) => t.hash === v.hash) === i
      );
      const newCodesStr = JSON.stringify(newCodes);
      localStorage.setItem("codes", newCodesStr);

      window.onstorage &&
        window.onstorage(
          new StorageEvent("storage", {
            key: "codes",
            newValue: JSON.stringify(r),
            oldValue: "",
            storageArea: localStorage,
          })
        );

      toast.success("Code submitted successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    detectLang(code);
  }, [code]);

  const canSubmit = code.length > 0;

  return (
    <>
      <Toaster />

      <Editor
        theme={themeName}
        height="500px"
        defaultLanguage={lang}
        language={lang}
        defaultValue={code}
        onChange={onChange}
      />
      <div className="h-2" />
      <div className="flex justify-end">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canSubmit || loading}
          onClick={submit}
        >
          Submit
        </button>
      </div>
    </>
  );
}
export default App;