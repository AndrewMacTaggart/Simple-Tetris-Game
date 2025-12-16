class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.currentInput = '0';
        this.previousInput = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                const number = button.getAttribute('data-number');
                this.inputNumber(number);
            });
        });

        // Operator buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                this.handleAction(action);
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    inputNumber(number) {
        if (this.waitingForOperand) {
            this.currentInput = number;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? number : this.currentInput + number;
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'clearEntry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.handleOperator(action);
                break;
            case 'equals':
                this.calculate();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'sin':
                this.scientificFunction('sin');
                break;
            case 'cos':
                this.scientificFunction('cos');
                break;
            case 'tan':
                this.scientificFunction('tan');
                break;
            case 'log':
                this.scientificFunction('log');
                break;
            case 'ln':
                this.scientificFunction('ln');
                break;
            case 'square':
                this.scientificFunction('square');
                break;
            case 'sqrt':
                this.scientificFunction('sqrt');
                break;
            case 'power':
                this.handleOperator('power');
                break;
            case 'pi':
                this.inputConstant(Math.PI);
                break;
            case 'e':
                this.inputConstant(Math.E);
                break;
            case 'memoryAdd':
                this.memoryAdd();
                break;
            case 'memorySubtract':
                this.memorySubtract();
                break;
            case 'memoryRecall':
                this.memoryRecall();
                break;
            case 'memoryClear':
                this.memoryClear();
                break;
        }
    }

    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === null) {
            this.previousInput = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation();

            this.currentInput = String(newValue);
            this.previousInput = newValue;
            this.updateDisplay();
        }

        this.waitingForOperand = true;
        this.operation = nextOperator;
    }

    performCalculation() {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);

        if (isNaN(prev) || isNaN(current)) return current;

        switch (this.operation) {
            case 'add':
                return prev + current;
            case 'subtract':
                return prev - current;
            case 'multiply':
                return prev * current;
            case 'divide':
                return current !== 0 ? prev / current : 0;
            case 'power':
                return Math.pow(prev, current);
            default:
                return current;
        }
    }

    calculate() {
        if (this.operation && this.previousInput !== null) {
            const result = this.performCalculation();
            this.currentInput = String(result);
            this.previousInput = null;
            this.operation = null;
            this.waitingForOperand = true;
            this.updateDisplay();
        }
    }

    scientificFunction(func) {
        const value = parseFloat(this.currentInput);
        let result;

        switch (func) {
            case 'sin':
                result = Math.sin(value);
                break;
            case 'cos':
                result = Math.cos(value);
                break;
            case 'tan':
                result = Math.tan(value);
                break;
            case 'log':
                result = value > 0 ? Math.log10(value) : 0;
                break;
            case 'ln':
                result = value > 0 ? Math.log(value) : 0;
                break;
            case 'square':
                result = value * value;
                break;
            case 'sqrt':
                result = value >= 0 ? Math.sqrt(value) : 0;
                break;
            default:
                return;
        }

        // Round to avoid floating point errors
        result = Math.round(result * 100000000) / 100000000;
        this.currentInput = String(result);
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    inputConstant(constant) {
        this.currentInput = String(constant);
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }

    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }

    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    memoryAdd() {
        this.memory += parseFloat(this.currentInput) || 0;
    }

    memorySubtract() {
        this.memory -= parseFloat(this.currentInput) || 0;
    }

    memoryRecall() {
        this.currentInput = String(this.memory);
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    memoryClear() {
        this.memory = 0;
    }

    updateDisplay() {
        // Format the display value
        let displayValue = this.currentInput;
        
        // Handle very long numbers
        if (displayValue.length > 12) {
            const num = parseFloat(displayValue);
            if (!isNaN(num)) {
                displayValue = num.toExponential(6);
            }
        }
        
        this.display.textContent = displayValue;
    }

    handleKeyboard(event) {
        const key = event.key;

        // Prevent default for calculator keys
        if (/[0-9+\-*/.=]/.test(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape') {
            event.preventDefault();
        }

        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (key === '+') {
            this.handleOperator('add');
        } else if (key === '-') {
            this.handleOperator('subtract');
        } else if (key === '*') {
            this.handleOperator('multiply');
        } else if (key === '/') {
            this.handleOperator('divide');
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === 'Escape') {
            this.clear();
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

