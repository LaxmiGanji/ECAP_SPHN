# Online Code Compiler Feature

## Overview
The Online Code Compiler is a new feature added to the Student section that allows students to write, compile, and run code in C, Java, and Python programming languages directly from their dashboard.

## Features

### 🚀 **Multi-Language Support**
- **Python**: Full Python 3.x support with standard library
- **Java**: Java compilation and execution with JDK
- **C**: C compilation and execution with GCC

### 💻 **Code Editor**
- Syntax-highlighted text area for code input
- Language-specific code templates
- Copy and clear functionality
- Responsive design for all screen sizes

### 🖥️ **Output Terminal**
- Real-time program output display
- Error message handling
- Copy output functionality
- Scrollable terminal interface

### 🔧 **User Experience**
- Language switching with automatic template loading
- Run button with loading states
- Error handling and user feedback
- Clean, modern UI design

## How to Use

### 1. **Access the Compiler**
- Login to your Student account
- Navigate to the "Online Compiler" option in the sidebar
- The compiler interface will load with Python as the default language

### 2. **Select Programming Language**
- Click on the language tabs (Python, Java, C) to switch
- Each language comes with a helpful starter template
- The code editor will automatically update with the new template

### 3. **Write Your Code**
- Use the large text area to write your code
- The editor supports all standard programming constructs
- You can modify the default template or write completely new code

### 4. **Run Your Code**
- Click the "Run Code" button to execute your program
- The button will show a loading spinner while processing
- Results will appear in the output terminal on the right

### 5. **View Results**
- Program output is displayed in the terminal
- Error messages are shown in red if compilation fails
- You can copy the output using the copy button

## Technical Requirements

### Backend Dependencies
The backend server must have the following installed:
- **Python**: Python 3.x interpreter
- **Java**: JDK (Java Development Kit)
- **C**: GCC (GNU Compiler Collection)

### Installation Commands

#### Ubuntu/Debian:
```bash
# Python (usually pre-installed)
sudo apt update
sudo apt install python3

# Java
sudo apt install openjdk-11-jdk

# GCC
sudo apt install build-essential
```

#### Windows:
- **Python**: Download from [python.org](https://python.org)
- **Java**: Download OpenJDK or Oracle JDK
- **C**: Install MinGW-w64 or use WSL

#### macOS:
```bash
# Python (usually pre-installed)
# Java
brew install openjdk@11

# GCC
brew install gcc
```

## API Endpoints

### Execute Code
```
POST /api/compiler/execute
```

**Request Body:**
```json
{
  "code": "your_code_here",
  "language": "python|java|c"
}
```

**Response:**
```json
{
  "success": true,
  "output": "program_output",
  "language": "python"
}
```

### Health Check
```
GET /api/compiler/health
```

**Response:**
```json
{
  "success": true,
  "message": "Compiler service is running",
  "supportedLanguages": ["python", "java", "c"]
}
```

## Security Features

- **Timeout Protection**: Code execution is limited to 10 seconds
- **Temporary Files**: All code files are created in temporary directories
- **Automatic Cleanup**: Temporary files are automatically deleted after execution
- **Input Validation**: Language and code content are validated before execution

## Troubleshooting

### Common Issues

1. **"Backend server is not running"**
   - Ensure the backend server is started on port 5000
   - Check if the compiler route is properly registered

2. **"Language not supported"**
   - Verify that the required language interpreters are installed
   - Check the backend logs for compilation errors

3. **Code execution timeout**
   - Ensure your code doesn't have infinite loops
   - Check for resource-intensive operations

4. **Permission denied errors**
   - Ensure the backend has write permissions to temp directories
   - Check if antivirus software is blocking file operations

### Debug Mode
Enable debug logging in the backend to see detailed execution information:
```javascript
console.log("Executing code:", code);
console.log("Language:", language);
console.log("Output:", output);
```

## Future Enhancements

- [ ] Support for additional programming languages (JavaScript, C++, Go)
- [ ] File upload/download functionality
- [ ] Code sharing between students
- [ ] Execution history and saved programs
- [ ] Real-time collaboration features
- [ ] Code formatting and linting
- [ ] Performance benchmarking tools

## Contributing

To add support for new programming languages:
1. Update the `supportedLanguages` array in the backend route
2. Add language-specific execution logic
3. Update the frontend language selection
4. Add appropriate code templates
5. Test thoroughly with various code examples

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
