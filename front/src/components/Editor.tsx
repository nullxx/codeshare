import React from "react";
import _Editor from "@monaco-editor/react";
import { ModelOperations } from "@vscode/vscode-languagedetection";
const Editor = Object.hasOwnProperty.call(_Editor, "default")
  ? (_Editor as any).default
  : _Editor;

import { toast, Toaster } from "react-hot-toast";
interface Lang {
  languageId: string;
  confidence: number;
}

const themePrefix = "vs-";

const replacements = [
  {
    from: "js",
    to: "javascript",
  },
  {
    from: "ts",
    to: "typescript",
  },
  {
    from: "py",
    to: "python",
  },
  {
    from: "rb",
    to: "ruby",
  },
];

const modelJSON = await import(
  "@vscode/vscode-languagedetection/model/model.json"
);

const buffer = await import(
  // @ts-expect-error
  "@vscode/vscode-languagedetection/model/group1-shard1of1.bin"
);

const modulOperations = new ModelOperations({
  modelJsonLoaderFunc: async () => {
    return modelJSON.default;
  },
  weightsLoaderFunc: async () => {
    const res = await fetch(buffer.default).then((res) => res.arrayBuffer());
    return res;
  },
});

function App() {
  const API_URL = import.meta.env.DEV
    ? "http://localhost:3004"
    : window.location.origin;

  const [code, setCode] = React.useState("");
  const [lang, setLang] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [theme, setTheme] = React.useState<string>(
    themePrefix + (localStorage.getItem("dark") === "true" ? "dark" : "light")
  );

  const detectLang = async (value: string) => {
    const langs = await modulOperations.runModel(value);
    if (!langs || langs.length === 0) {
      return;
    }

    const lang = langs.reduce((a: Lang, b: Lang) =>
      a.confidence > b.confidence ? a : b
    );

    const langName = lang.languageId;
    const langNameReplaced = replacements.reduce(
      (acc, cur) => (acc === cur.from ? cur.to : acc),
      langName
    );

    setLang(langNameReplaced);
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

      const prevCodes = JSON.parse(localStorage.getItem("links") || "[]");
      let newCodes = [...prevCodes, r];
      // remove duplicates
      newCodes = newCodes.filter(
        (v: { hash: string }, i: number, a: { hash: string }[]) =>
          a.findIndex((t) => t.hash === v.hash) === i
      );
      const newCodesStr = JSON.stringify(newCodes);
      localStorage.setItem("links", newCodesStr);

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
      setCode(""); // clear code
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    detectLang(code);
  }, [code]);

  React.useEffect(() => {
    const hander = (e: StorageEvent) => {
      if (e.key === "dark") {
        const theme = e.newValue === "true" ? "dark" : "light";
        const themeName = themePrefix + theme;
        setTheme(themeName);
      }
    };

    window.addEventListener("storage", hander);
  }, []);

  const canSubmit = code.length > 0;

  return (
    <>
      <Toaster />

      <Editor
        theme={theme}
        height="500px"
        defaultLanguage={lang}
        language={lang}
        defaultValue={code}
        value={code}
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
