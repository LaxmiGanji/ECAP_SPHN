import { useState, useEffect } from "react";
import { FiPlay, FiCode, FiTerminal, FiCopy, FiTrash2 } from "react-icons/fi";
import { baseApiURL } from "../../baseUrl";

const OnlineCompiler = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  // Initialize with default template
  useEffect(() => {
    setCode(defaultTemplates.python);
  }, []);

  
  // Default code templates for each language
  const defaultTemplates = {
    python: `# Welcome to Python Online Compiler
print("Hello, World!")

# Write your Python code here
name = input("Enter your name: ")
print(f"Hello, {name}!")`,
    java: `// Welcome to Java Online Compiler
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Write your Java code here
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}`,
    c: `// Welcome to C Online Compiler
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Write your C code here
    char name[100];
    printf("Enter your name: ");
    scanf("%s", name);
    printf("Hello, %s!\\n", name);
    
    return 0;
}`
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(defaultTemplates[language]);
    setOutput("");
    setError("");
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to run.");
      return;
    }

    setIsRunning(true);
    setError("");
    setOutput("");

    
    try {
      const response = await fetch(`${baseApiURL()}/api/compiler/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOutput(data.output);
      } else {
        setError(data.error || "An error occurred while running the code.");
      }
    } catch (err) {
      console.error("Compiler error:", err);
      if (err.message.includes("Failed to fetch")) {
        setError("Backend server is not running. Please start the backend server first.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearCode = () => {
    setCode(defaultTemplates[selectedLanguage]);
    setOutput("");
    setError("");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Online Code Compiler</h1>
          <p className="text-gray-600">Write, compile, and run your code in C, Java, and Python</p>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-white rounded-xl p-2 shadow-lg">
            {[
              { id: "python", name: "Python", color: "from-green-500 to-green-600" },
              { id: "java", name: "Java", color: "from-orange-500 to-orange-600" },
              { id: "c", name: "C", color: "from-blue-500 to-blue-600" }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                  selectedLanguage === lang.id
                    ? `bg-gradient-to-r ${lang.color} text-white shadow-lg transform scale-105`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FiCode className="w-5 h-5" />
                  <span>{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center">
                  <FiCode className="w-5 h-5 mr-2" />
                  Code Editor
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy Code"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearCode}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Clear Code"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                spellCheck="false"
              />
              
              <div className="mt-4">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isRunning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-5 h-5" />
                      <span>Run Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Terminal */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center">
                  <FiTerminal className="w-5 h-5 mr-2" />
                  Output Terminal
                </h3>
                {output && (
                  <button
                    onClick={handleCopyOutput}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy Output"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="bg-gray-900 text-green-400 font-mono text-sm rounded-lg p-4 h-96 overflow-y-auto">
                {error ? (
                  <div className="text-red-400">
                    <span className="text-red-500">Error:</span> {error}
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-gray-500 italic">
                    Output will appear here after running your code...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <FiCode className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Multiple Languages</h3>
            <p className="text-gray-600">Support for C, Java, and Python programming languages</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
              <FiPlay className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Instant Execution</h3>
            <p className="text-gray-600">Run your code immediately and see results in real-time</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <FiTerminal className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Output</h3>
            <p className="text-gray-600">View program output and error messages in the terminal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineCompiler;
