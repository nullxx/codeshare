import { useEffect, useState } from "react";

const maxCodes = 10;
const loadCodes = () => {
  const savedCodes = localStorage.getItem("codes");
  if (savedCodes) {
    let codes = JSON.parse(savedCodes);
    codes = codes.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return codes;
  }
  return [];
};

export default function History() {
  const API_URL = import.meta.env.DEV ? "http://localhost:3004" : window.location.origin;

  const [selectedCode, setSelectedCode] = useState<{
    shortId: string;
    hash: string;
    createdAt: string;
  } | null>(null);

  const [codes, setCodes] = useState<
    {
      shortId: string;
      hash: string;
      createdAt: string;
    }[]
  >(loadCodes());

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "codes") {
        setCodes(loadCodes());
        setSelectedCode(JSON.parse(e.newValue || "null"));
      }
    };
    window.onstorage = handleStorageChange;
  }, []);

  if (codes.length === 0) {
    return <></>;
  }


  return (
    <div className="max-h-[83vh]">
      {selectedCode && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-filter backdrop-blur-sm z-10">
          <div className="bg-gray-100 rounded-lg p-4 dark:bg-gray-800 w-[90%] h-[90%] dark:text-white border-2 border-gray-200 dark:border-gray-700 shadow-md">
            <button
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600"
              onClick={() => setSelectedCode(null)}
            >
              <svg
                className="dark:fill-white fill-black"
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM15.36 14.3C15.65 14.59 15.65 15.07 15.36 15.36C15.21 15.51 15.02 15.58 14.83 15.58C14.64 15.58 14.45 15.51 14.3 15.36L12 13.06L9.7 15.36C9.55 15.51 9.36 15.58 9.17 15.58C8.98 15.58 8.79 15.51 8.64 15.36C8.35 15.07 8.35 14.59 8.64 14.3L10.94 12L8.64 9.7C8.35 9.41 8.35 8.93 8.64 8.64C8.93 8.35 9.41 8.35 9.7 8.64L12 10.94L14.3 8.64C14.59 8.35 15.07 8.35 15.36 8.64C15.65 8.93 15.65 9.41 15.36 9.7L13.06 12L15.36 14.3Z"
                  className="dark:text-white"
                />
              </svg>
            </button>
            <div className="flex justify-between">
              <a href={`${import.meta.env.BASE_URL}?code=${selectedCode?.shortId}`} className="text-xl font-bold" target="_blank">
                {selectedCode?.shortId}
                <svg width="20px" height="20px" viewBox="0 0 1024 1024" className="icon inline ml-2"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M811.3 938.7H217.5c-71.5 0-129.8-58.2-129.8-129.8V215.1c0-71.6 58.2-129.8 129.8-129.8h296.9c23.6 0 42.7 19.1 42.7 42.7s-19.1 42.7-42.7 42.7H217.5c-24.5 0-44.4 19.9-44.4 44.4v593.8c0 24.5 19.9 44.4 44.4 44.4h593.8c24.5 0 44.4-19.9 44.4-44.4V512c0-23.6 19.1-42.7 42.7-42.7S941 488.4 941 512v296.9c0 71.6-58.2 129.8-129.7 129.8z" fill="#3688FF" /><path d="M898.4 405.3c-23.6 0-42.7-19.1-42.7-42.7V212.9c0-23.3-19-42.3-42.3-42.3H663.7c-23.6 0-42.7-19.1-42.7-42.7s19.1-42.7 42.7-42.7h149.7c70.4 0 127.6 57.2 127.6 127.6v149.7c0 23.7-19.1 42.8-42.6 42.8z" fill="#5F6379" /><path d="M373.6 712.6c-10.9 0-21.8-4.2-30.2-12.5-16.7-16.7-16.7-43.7 0-60.3L851.2 132c16.7-16.7 43.7-16.7 60.3 0 16.7 16.7 16.7 43.7 0 60.3L403.8 700.1c-8.4 8.3-19.3 12.5-30.2 12.5z" fill="#5F6379" /></svg>
              </a>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedCode?.createdAt}
              </p>
            </div>

            <div className="h-2" />

            <iframe
              src={`${API_URL}/${selectedCode?.shortId}`}
              style={{ height: "inherit" }}
              className="w-full h-full dark:bg-gray-900"
            />
          </div>
        </div>
      )}

      <div className="md:w-[200px] w-full max-h-[83vh]">
        <div className="bg-gray-100 rounded-lg p-4 dark:bg-gray-800 max-h-[83vh]">
          <h1 className="text-xl font-bold">History</h1>
          <div className="h-2" />
          <div className="bg-gray-200 rounded-lg p-4 dark:bg-gray-700 overflow-scroll">
            {loadCodes()
              .slice(0, maxCodes)
              .map(
                (
                  code: {
                    shortId: string;
                    hash: string;
                    createdAt: string;
                  },
                  index: number
                ) => (
                  <div key={index}>
                    <button
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600"
                      onClick={() => setSelectedCode(code)}
                    >
                      {code.shortId}
                    </button>
                  </div>
                )
              )}
          </div>
          <p>
            Showing {codes.length > maxCodes ? maxCodes : codes.length} of{" "}
            {codes.length} codes
          </p>
        </div>
        <div className="h-2" />
      </div>
    </div>
  );
}
