import { useState, useEffect, ChangeEvent, FormEvent } from "react";

// Check if a string is a valid HTTP/HTTPS URL
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (err) {
    return false;
  }
};

export const BlockList = () => {
  const [blockInput, setBlockInput] = useState<string>("");
  const [blockList, setBlockList] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // Load from chrome.storage.local on mount
  useEffect(() => {
    chrome.storage.local.get(["blockList"], (result) => {
      if (Array.isArray(result.blockList)) {
        setBlockList(result.blockList);
      }
    });
  }, []);

  const saveToStorage = async (newList: string[]) => {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ blockList: newList }, () => resolve());
    });
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidUrl(blockInput)) {
      setError("Please enter a valid URL (starting with http:// or https://)");
      return;
    }
    if (blockList.includes(blockInput)) {
      setError("This URL is already in the block list.");
      return;
    }

    const updatedList = [...blockList, blockInput];
    setBlockList(updatedList);
    await saveToStorage(updatedList);

    setBlockInput("");
    setError("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBlockInput(e.target.value);
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-red-600">Blocked List</h1>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          placeholder="https://example.com"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={blockInput}
          onChange={handleChange}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition"
        >
          Add to Block List
        </button>
      </form>

      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
        {blockList.length === 0 ? (
          <p className="text-gray-500">You currently have no blocked items.</p>
        ) : (
          blockList.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm"
            >
              <span className="text-gray-700 text-sm break-all">{item}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
