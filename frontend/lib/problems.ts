// lib/problems.ts
// Banco de problemas para el módulo de Code Challenge

export type Difficulty = "easy" | "medium" | "hard";

export interface TestCase {
  input: unknown[];
  expected: unknown;
  label?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string[];
  timeLimit: number; // minutos
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  starterCode: string;
  functionName: string; // nombre de la función a evaluar
  testCases: TestCase[];
  hints: string[];
}

export const PROBLEMS: Problem[] = [
  // ──────────────────────────────────────────
  // 1. Two Sum
  // ──────────────────────────────────────────
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    category: ["Arrays", "Hash Map"],
    timeLimit: 15,
    description: `Dado un arreglo de enteros \`nums\` y un entero \`target\`, retorna los índices de los dos números que suman \`target\`.

Puedes asumir que cada entrada tiene exactamente una solución, y no puedes usar el mismo elemento dos veces.

Puedes retornar la respuesta en cualquier orden.`,
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6",
      },
    ],
    starterCode: `function twoSum(nums, target) {
  // Escribe tu solución aquí

}`,
    functionName: "twoSum",
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
    ],
    hints: [
      "¿Qué estructura de datos te permite buscar un complemento en O(1)?",
      "Usa un Map para guardar cada número y su índice mientras recorres el arreglo.",
    ],
  },

  // ──────────────────────────────────────────
  // 2. Valid Parentheses
  // ──────────────────────────────────────────
  {
    id: "valid-parentheses",
    title: "Paréntesis Válidos",
    difficulty: "easy",
    category: ["Strings", "Stack"],
    timeLimit: 15,
    description: `Dado un string \`s\` que contiene solo los caracteres \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` y \`']'\`, determina si el string de entrada es válido.

Un string de entrada es válido si:
- Los corchetes abiertos deben cerrarse con el mismo tipo de corchete.
- Los corchetes abiertos deben cerrarse en el orden correcto.
- Cada corchete de cierre tiene un corchete abierto correspondiente del mismo tipo.`,
    examples: [
      { input: 's = "()"', output: "true", explanation: "Paréntesis simple válido." },
      { input: 's = "()[]{}"', output: "true", explanation: "Tres pares válidos." },
      { input: 's = "(]"', output: "false", explanation: "Tipos de cierre incorrectos." },
    ],
    starterCode: `function isValid(s) {
  // Escribe tu solución aquí

}`,
    functionName: "isValid",
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
    ],
    hints: [
      "Usa una pila (stack). Al ver un abre-corchete, empuja; al ver un cierra-corchete, compara con el top.",
      "Al final, si la pila está vacía, el string es válido.",
    ],
  },

  // ──────────────────────────────────────────
  // 3. Reverse String
  // ──────────────────────────────────────────
  {
    id: "reverse-string",
    title: "Invertir String",
    difficulty: "easy",
    category: ["Strings", "Two Pointers"],
    timeLimit: 10,
    description: `Escribe una función que invierta un string. La entrada es un arreglo de caracteres \`s\`.

Debes hacer esto **modificando el arreglo in-place** con O(1) de memoria extra.`,
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: "El arreglo se invierte en su lugar.",
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: "",
      },
    ],
    starterCode: `function reverseString(s) {
  // Modifica el arreglo in-place y retórnalo

}`,
    functionName: "reverseString",
    testCases: [
      { input: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"] },
      { input: [["H", "a", "n", "n", "a", "h"]], expected: ["h", "a", "n", "n", "a", "H"] },
    ],
    hints: ["Usa dos punteros: uno al inicio y otro al final, e intercámbialos moviéndolos hacia el centro."],
  },

  // ──────────────────────────────────────────
  // 4. FizzBuzz
  // ──────────────────────────────────────────
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "easy",
    category: ["Math", "Strings"],
    timeLimit: 10,
    description: `Dado un entero \`n\`, retorna un arreglo de strings donde:
- Para múltiplos de 3, el elemento es \`"Fizz"\`.
- Para múltiplos de 5, el elemento es \`"Buzz"\`.
- Para múltiplos de ambos 3 y 5, el elemento es \`"FizzBuzz"\`.
- Para cualquier otro número, el elemento es el número como string.`,
    examples: [
      {
        input: "n = 3",
        output: '["1", "2", "Fizz"]',
        explanation: "3 es múltiplo de 3.",
      },
      {
        input: "n = 5",
        output: '["1", "2", "Fizz", "4", "Buzz"]',
        explanation: "5 es múltiplo de 5.",
      },
      {
        input: "n = 15",
        output: '["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]',
        explanation: "15 es múltiplo de 3 y 5.",
      },
    ],
    starterCode: `function fizzBuzz(n) {
  // Escribe tu solución aquí

}`,
    functionName: "fizzBuzz",
    testCases: [
      { input: [3], expected: ["1", "2", "Fizz"] },
      { input: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
      { input: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] },
    ],
    hints: ["Verifica primero el caso FizzBuzz (divisible por ambos) antes de los casos individuales."],
  },

  // ──────────────────────────────────────────
  // 5. Contains Duplicate
  // ──────────────────────────────────────────
  {
    id: "contains-duplicate",
    title: "Contiene Duplicado",
    difficulty: "easy",
    category: ["Arrays", "Hash Map"],
    timeLimit: 10,
    description: `Dado un arreglo de enteros \`nums\`, retorna \`true\` si algún valor aparece al menos dos veces, y \`false\` si cada elemento es distinto.`,
    examples: [
      { input: "nums = [1,2,3,1]", output: "true", explanation: "El 1 aparece dos veces." },
      { input: "nums = [1,2,3,4]", output: "false", explanation: "Todos los elementos son distintos." },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true", explanation: "Hay varios duplicados." },
    ],
    starterCode: `function containsDuplicate(nums) {
  // Escribe tu solución aquí

}`,
    functionName: "containsDuplicate",
    testCases: [
      { input: [[1, 2, 3, 1]], expected: true },
      { input: [[1, 2, 3, 4]], expected: false },
      { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
    ],
    hints: ["Un Set no permite duplicados. Compara su tamaño con el del arreglo original."],
  },

  // ──────────────────────────────────────────
  // 6. Maximum Subarray (Kadane's)
  // ──────────────────────────────────────────
  {
    id: "maximum-subarray",
    title: "Subarreglo Máximo",
    difficulty: "medium",
    category: ["Arrays", "Dynamic Programming"],
    timeLimit: 20,
    description: `Dado un arreglo de enteros \`nums\`, encuentra el subarreglo (que contenga al menos un elemento) con la suma más grande y retorna su suma.

Un subarreglo es una parte contigua de un arreglo.`,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "El subarreglo [4,-1,2,1] tiene la suma más grande = 6.",
      },
      { input: "nums = [1]", output: "1", explanation: "Solo hay un elemento." },
      { input: "nums = [5,4,-1,7,8]", output: "23", explanation: "Todo el arreglo suma 23." },
    ],
    starterCode: `function maxSubArray(nums) {
  // Escribe tu solución aquí

}`,
    functionName: "maxSubArray",
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
    ],
    hints: [
      "El algoritmo de Kadane resuelve esto en O(n).",
      "Mantén dos variables: la suma actual del subarreglo y la máxima suma vista.",
      "Si la suma actual se vuelve negativa, reiníciala a 0 (empieza un nuevo subarreglo).",
    ],
  },

  // ──────────────────────────────────────────
  // 7. Palindrome Check
  // ──────────────────────────────────────────
  {
    id: "valid-palindrome",
    title: "Palíndromo Válido",
    difficulty: "easy",
    category: ["Strings", "Two Pointers"],
    timeLimit: 10,
    description: `Una frase es palíndromo si, después de convertir todos los caracteres en minúsculas y eliminar todos los caracteres no alfanuméricos, se lee igual hacia adelante que hacia atrás.

Dado un string \`s\`, retorna \`true\` si es un palíndromo, o \`false\` en caso contrario.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: '"amanaplanacanalpanama" es palíndromo.',
      },
      { input: 's = "race a car"', output: "false", explanation: '"raceacar" no es palíndromo.' },
      { input: 's = " "', output: "true", explanation: "Un string vacío es palíndromo." },
    ],
    starterCode: `function isPalindrome(s) {
  // Escribe tu solución aquí

}`,
    functionName: "isPalindrome",
    testCases: [
      { input: ["A man, a plan, a canal: Panama"], expected: true },
      { input: ["race a car"], expected: false },
      { input: [" "], expected: true },
    ],
    hints: [
      "Primero limpia el string: solo letras y dígitos, todo en minúsculas.",
      "Luego usa dos punteros (inicio y fin) para comparar caracteres.",
    ],
  },

  // ──────────────────────────────────────────
  // 8. Climbing Stairs
  // ──────────────────────────────────────────
  {
    id: "climbing-stairs",
    title: "Escalera de Escalones",
    difficulty: "easy",
    category: ["Dynamic Programming", "Math"],
    timeLimit: 15,
    description: `Estás subiendo una escalera. Se necesitan \`n\` escalones para llegar arriba.

Cada vez puedes subir 1 o 2 escalones. ¿De cuántas maneras distintas puedes llegar a la cima?`,
    examples: [
      { input: "n = 2", output: "2", explanation: "1+1 o 2." },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, o 2+1." },
    ],
    starterCode: `function climbStairs(n) {
  // Escribe tu solución aquí

}`,
    functionName: "climbStairs",
    testCases: [
      { input: [2], expected: 2 },
      { input: [3], expected: 3 },
      { input: [5], expected: 8 },
      { input: [10], expected: 89 },
    ],
    hints: [
      "Nota el patrón: climbStairs(n) = climbStairs(n-1) + climbStairs(n-2).",
      "Es exactamente la secuencia de Fibonacci. Puedes resolverlo con DP en O(n).",
    ],
  },

  // ──────────────────────────────────────────
  // 9. Merge Sorted Array
  // ──────────────────────────────────────────
  {
    id: "merge-sorted-array",
    title: "Unir Arreglos Ordenados",
    difficulty: "easy",
    category: ["Arrays", "Two Pointers"],
    timeLimit: 15,
    description: `Se dan dos arreglos de enteros ordenados de forma no decreciente: \`nums1\` y \`nums2\`, y dos enteros \`m\` y \`n\`, representando el número de elementos en \`nums1\` y \`nums2\` respectivamente.

Combina \`nums1\` y \`nums2\` en un solo arreglo ordenado de forma no decreciente.

El arreglo resultante no debe ser retornado sino almacenado dentro del arreglo \`nums1\`. Para acomodar esto, \`nums1\` tiene una longitud de \`m + n\`, donde los primeros \`m\` elementos denotan los elementos que deben ser fusionados, y los últimos \`n\` elementos son 0 y deben ser ignorados.`,
    examples: [
      {
        input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        output: "[1,2,2,3,5,6]",
        explanation: "Los arreglos se unen en: [1,2,2,3,5,6].",
      },
    ],
    starterCode: `function merge(nums1, m, nums2, n) {
  // Modifica nums1 in-place

}`,
    functionName: "merge",
    testCases: [
      {
        input: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3],
        expected: [1, 2, 2, 3, 5, 6],
        label: "nums1=[1,2,3,0,0,0] m=3 nums2=[2,5,6] n=3",
      },
      {
        input: [[1], 1, [], 0],
        expected: [1],
        label: "nums1=[1] m=1 nums2=[] n=0",
      },
      {
        input: [[0], 0, [1], 1],
        expected: [1],
        label: "nums1=[0] m=0 nums2=[1] n=1",
      },
    ],
    hints: [
      "Empieza desde el final de ambos arreglos para evitar sobrescribir elementos.",
      "Usa tres punteros: uno al final de nums1, uno al final de nums2 y uno al final del resultado.",
    ],
  },

  // ──────────────────────────────────────────
  // 10. Best Time to Buy and Sell Stock
  // ──────────────────────────────────────────
  {
    id: "best-time-stock",
    title: "Mejor Momento para Comprar Acciones",
    difficulty: "easy",
    category: ["Arrays", "Greedy"],
    timeLimit: 15,
    description: `Se da un arreglo \`prices\` donde \`prices[i]\` es el precio de una acción en el día \`i\`.

Quieres maximizar tu ganancia eligiendo un solo día para comprar una acción y un día diferente en el futuro para venderla.

Retorna la ganancia máxima que puedes obtener de esta transacción. Si no puedes obtener ninguna ganancia, retorna \`0\`.`,
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Compra el día 2 (precio=1), vende el día 5 (precio=6). Ganancia = 6-1 = 5.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "Los precios solo bajan. No hay ganancia posible.",
      },
    ],
    starterCode: `function maxProfit(prices) {
  // Escribe tu solución aquí

}`,
    functionName: "maxProfit",
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[1, 2]], expected: 1 },
    ],
    hints: [
      "Mantén el precio mínimo visto hasta ahora y calcula la ganancia actual en cada paso.",
      "La ganancia máxima es el máximo de (precio actual - precio mínimo histórico).",
    ],
  },
];

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  hard: "text-red-400 bg-red-400/10 border-red-400/20",
};
