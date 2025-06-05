// function factorial(n) {
//     if (typeof n !== "number" || n < 0 || n > 1000 || !Number.isInteger(n)) {
//         throw new Error("Input must be an integer between 0 and 1000.");
//     }
//     let result = 1n;
//     for (let i = 2n; i <= BigInt(n); i++) {
//         result *= i;
//     }
//     return result.toString();
// }

// function calculateFactorial() {
//     const input = document.getElementById('numberInput').value;
//     const resultElem = document.getElementById('result');
//     try {
//         const num = Number(input);
//         const fact = factorial(num);
//         resultElem.textContent = `Factorial of ${num} is: ${fact}`;
//     } catch (err) {
//         resultElem.textContent = err.message;
//     }
// }


function factorial(n) {
    if (typeof n !== "number" || n < 0 || n > 1000 || !Number.isInteger(n)) {
        throw new Error("Input must be an integer between 0 and 1000.");
    }

    let result = [1]; // Initialize with 1

    for (let i = 2; i <= n; i++) {
        multiply(result, i);
    }

    return result.reverse().join(""); // Convert array to string
}

function multiply(result, num) {
    let carry = 0;
    for (let i = 0; i < result.length; i++) {
        let prod = result[i] * num + carry;
        result[i] = prod % 10;
        carry = Math.floor(prod / 10);
    }

    while (carry > 0) {
        result.push(carry % 10);
        carry = Math.floor(carry / 10);
    }
}

function calculateFactorial() {
    const input = document.getElementById('numberInput').value;
    const resultElem = document.getElementById('result');
    try {
        const num = Number(input);
        const fact = factorial(num);
        resultElem.textContent = `Factorial of ${num} is: ${fact}`;
    } catch (err) {
        resultElem.textContent = err.message;
    }
}