//student/compiler.route.js
const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Route to execute code
router.post("/execute", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required"
      });
    }

    // Validate language
    const supportedLanguages = ["python", "java", "c"];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language. Supported: python, java, c"
      });
    }

    // Create temporary directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "compiler-"));
    let output = "";
    let error = "";

    try {
      if (language === "python") {
        // Execute Python code
        const pythonFile = path.join(tempDir, "code.py");
        fs.writeFileSync(pythonFile, code);

        output = await new Promise((resolve, reject) => {
          exec(`python3 "${pythonFile}"`, { timeout: 10000 }, (err, stdout, stderr) => {
            if (err) {
              reject(stderr || err.message);
            } else {
              resolve(stdout);
            }
          });
        });

      } else if (language === "java") {
        // Execute Java code
        const javaFile = path.join(tempDir, "Main.java");
        fs.writeFileSync(javaFile, code);

        // Compile Java
        await new Promise((resolve, reject) => {
          exec(`javac "${javaFile}"`, { cwd: tempDir, timeout: 10000 }, (err, stdout, stderr) => {
            if (err) {
              reject(stderr || err.message);
            } else {
              resolve(stdout);
            }
          });
        });

        // Run Java
        output = await new Promise((resolve, reject) => {
          exec(`java -cp "${tempDir}" Main`, { timeout: 10000 }, (err, stdout, stderr) => {
            if (err) {
              reject(stderr || err.message);
            } else {
              resolve(stdout);
            }
          });
        });

      } else if (language === "c") {
        // Execute C code
        const cFile = path.join(tempDir, "code.c");
        const exeFile = path.join(tempDir, "code.exe");
        fs.writeFileSync(cFile, code);

        // Compile C
        await new Promise((resolve, reject) => {
          exec(`gcc "${cFile}" -o "${exeFile}"`, { timeout: 10000 }, (err, stdout, stderr) => {
            if (err) {
              reject(stderr || err.message);
            } else {
              resolve(stdout);
            }
          });
        });
        

        // Run C
        output = await new Promise((resolve, reject) => {
          exec(`"${exeFile}"`, { timeout: 10000 }, (err, stdout, stderr) => {
            if (err) {
              reject(stderr || err.message);
            } else {
              resolve(stdout);
            }
          });
        });
      }

      res.json({
        success: true,
        output: output || "Code executed successfully with no output",
        language
      });

    } catch (execError) {
      error = execError.toString();
      res.json({
        success: false,
        error: error,
        language
      });
    } finally {
      // Clean up temporary files
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error("Error cleaning up temp files:", cleanupError);
      }
    }

  } catch (error) {
    console.error("Compiler error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Health check route
router.get("/health", (req, res) => {
  // Check if compilers are available
  const compilers = {
    python: false,
    java: false,
    c: false
  };

  // Test Python
  exec('python3 --version', (err) => {
    compilers.python = !err;
    
    // Test Java
    exec('java --version', (err) => {
      compilers.java = !err;
      
      // Test C
      exec('gcc --version', (err) => {
        compilers.c = !err;
        
        res.json({
          success: true,
          message: "Compiler service is running",
          supportedLanguages: ["python", "java", "c"],
          compilers: compilers,
          timestamp: new Date().toISOString()
        });
      });
    });
  });
});

module.exports = router;
