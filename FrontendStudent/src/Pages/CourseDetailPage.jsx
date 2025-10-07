// CourseDetailPage.jsx
import React, { useState, useEffect, useRef } from "react";

/* ---------------- Helper functions (fuzzy matching) ---------------- */
function normalizeTextToTokens(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[\W_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Token-level F1 overlap (simple and effective for keyword matching)
function tokenF1(studentText, teacherText) {
  const sTokens = normalizeTextToTokens(studentText);
  const tTokens = normalizeTextToTokens(teacherText);
  if (sTokens.length === 0 || tTokens.length === 0) return 0;

  let common = 0;
  const tCounts = {};
  tTokens.forEach((w) => (tCounts[w] = (tCounts[w] || 0) + 1));
  sTokens.forEach((w) => {
    if (tCounts[w] && tCounts[w] > 0) {
      common++;
      tCounts[w]--;
    }
  });

  const precision = common / sTokens.length;
  const recall = common / tTokens.length;
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

function isAnswerCorrectById(studentAns, teacherAns, qid) {
  const score = tokenF1(studentAns || "", teacherAns || "");
  // thresholds: short (1-10) -> 0.6, coding (11-20) -> 0.35, long (21-30) -> 0.5
  const threshold = qid >= 11 && qid <= 20 ? 0.35 : qid >= 21 ? 0.5 : 0.6;
  return { correct: score >= threshold, score };
}

/* ---------------- Data: Quiz (20 MCQs), Assignments, Test Questions ---------------- */

// 20 MCQ quiz questions
const quizQuestions = [
  { id: 1, question: "Which of the following is a mutable data type in Python?", options: ["List", "Tuple", "String", "Integer"], correct: "List" },
  { id: 2, question: "What is the output of: print(2 ** 3)?", options: ["6", "8", "9", "23"], correct: "8" },
  { id: 3, question: "Which keyword is used to define a function in Python?", options: ["func", "def", "function", "define"], correct: "def" },
  { id: 4, question: "Which of the following is not a Python keyword?", options: ["pass", "eval", "lambda", "yield"], correct: "eval" },
  { id: 5, question: "What is the output of len([1,2,3,4])?", options: ["3", "4", "5", "Error"], correct: "4" },
  { id: 6, question: "Which operator is used for floor division in Python?", options: ["/", "//", "%", "**"], correct: "//" },
  { id: 7, question: "What will print(type((1,))) output?", options: ["tuple", "int", "list", "None"], correct: "tuple" },
  { id: 8, question: "Which of these is used to handle exceptions in Python?", options: ["try-except", "do-catch", "error-handler", "handle"], correct: "try-except" },
  { id: 9, question: "Which function is used to get user input?", options: ["input()", "read()", "scanf()", "get()"], correct: "input()" },
  { id: 10, question: "What is the correct way to import a module?", options: ["import math", "include math", "using math", "require math"], correct: "import math" },
  { id: 11, question: "Which of these data types is unordered?", options: ["List", "Tuple", "Set", "String"], correct: "Set" },
  { id: 12, question: "What does 'pass' keyword do?", options: ["Stops execution", "Does nothing", "Skips next line", "Raises error"], correct: "Does nothing" },
  { id: 13, question: "How to start a comment in Python?", options: ["//", "#", "/*", "--"], correct: "#" },
  { id: 14, question: "Which method adds an element at the end of a list?", options: ["insert()", "append()", "extend()", "add()"], correct: "append()" },
  { id: 15, question: "What is the output of bool(0)?", options: ["True", "False", "0", "Error"], correct: "False" },
  { id: 16, question: "Which of these is a Python loop?", options: ["for", "while", "do-while", "Both A and B"], correct: "Both A and B" },
  { id: 17, question: "Which keyword is used to create a class?", options: ["class", "def", "object", "struct"], correct: "class" },
  { id: 18, question: "Which method removes an item from a list by value?", options: ["pop()", "remove()", "delete()", "discard()"], correct: "remove()" },
  { id: 19, question: "What is the output of 'Hello' + 'World'?", options: ["Hello World", "HelloWorld", "Error", "Hello+World"], correct: "HelloWorld" },
  { id: 20, question: "Which of the following is a Python Boolean operator?", options: ["and", "&&", "or", "not"], correct: "and" },
];

// Assignment questions (6 Java tasks)
const assignmentQuestions = [
  { id: 1, question: "Write a Java program to calculate the factorial of a number using recursion." },
  { id: 2, question: "Write a Java program to check if a string is a palindrome." },
  { id: 3, question: "Create a Java class 'Student' with fields name, age, and grade. Include methods to display details." },
  { id: 4, question: "Write a Java program to find the largest element in an array." },
  { id: 5, question: "Write a Java program to demonstrate method overloading." },
  { id: 6, question: "Write a Java program to handle exceptions using try-catch block." },
];

// Test Paper: Q1-10 short
const shortQuestions = [
  { id: 1, question: "What is the size of int in C?" , answer: "Typically 4 bytes on most modern systems."},
  { id: 2, question: "Define pointer." , answer: "A pointer is a variable that stores the memory address of another variable."},
  { id: 3, question: "What is the difference between = and == ?" , answer: "= assigns a value to a variable, == compares values for equality."},
  { id: 4, question: "What is a NULL pointer?" , answer: "A pointer that points to nothing; commonly assigned value 0 (NULL)."},
  { id: 5, question: "What is the default return type of main()?" , answer: "int — the C standard expects main to return an int."},
  { id: 6, question: "Define structure in C." , answer: "A user-defined data type that groups variables under a single name."},
  { id: 7, question: "What is a static variable?" , answer: "A variable that retains value between function calls and has program lifetime."},
  { id: 8, question: "What is the output of printf(\"%d\", 3/2)?" , answer: "1 (integer division)"},
  { id: 9, question: "What is recursion?" , answer: "When a function calls itself directly or indirectly."},
  { id: 10, question: "Difference between while and do-while loop?" , answer: "while checks condition first; do-while executes body once then checks the condition."},
];

// Test Paper: Q11-20 coding (C programs) — teacher answers are full programs
const codingQuestions = [
  {
    id: 11,
    question: "Write a C program to swap two numbers using a temporary variable.",
    answer:
`#include <stdio.h>

int main(void) {
    int a, b, temp;
    printf("Enter two integers: ");
    if (scanf("%d %d", &a, &b) != 2) return 0;
    temp = a;
    a = b;
    b = temp;
    printf("After swapping: a = %d, b = %d\\n", a, b);
    return 0;
}`
  },
  {
    id: 12,
    question: "Write a C program to check if a number is prime.",
    answer:
`#include <stdio.h>
#include <math.h>

int main(void) {
    int n, i, isPrime = 1;
    printf("Enter an integer: ");
    if (scanf("%d", &n) != 1) return 0;
    if (n <= 1) isPrime = 0;
    for (i = 2; i <= (int)sqrt(n); i++) {
        if (n % i == 0) { isPrime = 0; break; }
    }
    if (isPrime) printf("%d is prime\\n", n);
    else printf("%d is not prime\\n", n);
    return 0;
}`
  },
  {
    id: 13,
    question: "Write a C program to find the sum of an array of 10 numbers.",
    answer:
`#include <stdio.h>

int main(void) {
    int arr[10], i;
    long sum = 0;
    printf("Enter 10 integers:\\n");
    for (i = 0; i < 10; i++) scanf("%d", &arr[i]);
    for (i = 0; i < 10; i++) sum += arr[i];
    printf("Sum = %ld\\n", sum);
    return 0;
}`
  },
  {
    id: 14,
    question: "Write a C program to reverse a string.",
    answer:
`#include <stdio.h>
#include <string.h>

int main(void) {
    char s[200];
    printf("Enter a string: ");
    if (fgets(s, sizeof(s), stdin) == NULL) return 0;
    size_t len = strlen(s);
    if (len && s[len - 1] == '\\n') s[len - 1] = '\\0', len--;
    for (int i = len - 1; i >= 0; i--) putchar(s[i]);
    putchar('\\n');
    return 0;
}`
  },
  {
    id: 15,
    question: "Write a C program to find the largest of three numbers.",
    answer:
`#include <stdio.h>

int main(void) {
    int a, b, c;
    printf("Enter three integers: ");
    if (scanf("%d %d %d", &a, &b, &c) != 3) return 0;
    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;
    printf("Largest = %d\\n", max);
    return 0;
}`
  },
  {
    id: 16,
    question: "Write a C function to calculate the power of a number (integer exponent).",
    answer:
`#include <stdio.h>

long int ipow(int base, int exp) {
    long int result = 1;
    for (int i = 0; i < exp; i++) result *= base;
    return result;
}

int main(void) {
    int b, e;
    printf("Enter base and exponent: ");
    if (scanf("%d %d", &b, &e) != 2) return 0;
    printf("%d^%d = %ld\\n", b, e, ipow(b, e));
    return 0;
}`
  },
  {
    id: 17,
    question: "Write a C program to count vowels in a string.",
    answer:
`#include <stdio.h>
#include <ctype.h>

int main(void) {
    char buf[500];
    if (!fgets(buf, sizeof(buf), stdin)) return 0;
    int count = 0;
    for (int i = 0; buf[i]; i++) {
        char c = tolower((unsigned char)buf[i]);
        if (c=='a' || c=='e' || c=='i' || c=='o' || c=='u') count++;
    }
    printf("Vowels = %d\\n", count);
    return 0;
}`
  },
  {
    id: 18,
    question: "Write a C program that demonstrates array of pointers (array of strings).",
    answer:
`#include <stdio.h>

int main(void) {
    const char *names[] = {"Alice", "Bob", "Charlie", "Diana"};
    int n = sizeof(names)/sizeof(names[0]);
    for (int i = 0; i < n; i++) {
        printf("Name %d: %s\\n", i+1, names[i]);
    }
    return 0;
}`
  },
  {
    id: 19,
    question: "Write a C program to sort an array using bubble sort.",
    answer:
`#include <stdio.h>

int main(void) {
    int n;
    printf("How many elements? ");
    if (scanf("%d", &n) != 1) return 0;
    int arr[100];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-1-i; j++) {
            if (arr[j] > arr[j+1]) {
                int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;
            }
        }
    }
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`
  },
  {
    id: 20,
    question: "Write a C program to search an element using binary search (sorted array).",
    answer:
`#include <stdio.h>

int binary_search(int arr[], int n, int key) {
    int l = 0, r = n - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == key) return m;
        if (arr[m] < key) l = m + 1;
        else r = m - 1;
    }
    return -1;
}

int main(void) {
    int n, key;
    if (scanf("%d", &n) != 1) return 0;
    int arr[100];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    scanf("%d", &key);
    int idx = binary_search(arr, n, key);
    if (idx >= 0) printf("Found at index %d\\n", idx);
    else printf("Not found\\n");
    return 0;
}`
  },
];

// Test Paper: Q21-30 long subjective answers (~10 lines)
const longQuestions = [
  {
    id: 21,
    question: "Explain how a switch-case works in C and write a sample program for a simple calculator using switch-case.",
    answer:
`A switch-case statement evaluates an expression and transfers control to the matching case label. It's useful when you have multiple discrete choices. Each case ends with a break to avoid fall-through (unless fall-through is desired). Default handles unmatched cases. Example program: include stdio.h, read two numbers and an operator char, then use switch(op) { case '+': printf(...); break; ... default: printf("Invalid operator"); } This keeps code structured and readable for multi-way branching.`
  },
  {
    id: 22,
    question: "Describe defining a student structure in C and show how to create and display its details.",
    answer:
`A struct groups related data fields under a single type; for student use fields like name, id, grade, age. Declare struct Student { char name[50]; int id; int age; float grade; }; Create a variable struct Student s; assign values using strcpy for name and direct assignment for others. To display, use printf to format each field. Structures enable modeling of complex entities and passing grouped data to functions.`
  },
  {
    id: 23,
    question: "Explain how to implement a stack using arrays in C and include push/pop logic.",
    answer:
`A stack is LIFO. Implementation with array uses an integer top initialized to -1. push checks overflow (top == max-1), then arr[++top] = value. pop checks underflow (top == -1) then returns arr[top--]. Provide functions push(), pop(), peek(), and isEmpty(). Use these to build algorithms requiring last-in-first-out behavior such as parentheses matching.`
  },
  {
    id: 24,
    question: "Explain implementing a queue using linked list in C and mention enqueue/dequeue operations.",
    answer:
`A queue is FIFO. Linked-list-based queue uses struct Node { data; Node *next; } and two pointers front and rear. Enqueue: create node, if rear==NULL set front=rear=node else rear->next=node; rear=node. Dequeue: if front==NULL it's empty; else take temp=front; front=front->next; if(front==NULL) rear=NULL; free(temp). This supports dynamic size and efficient O(1) enqueue/dequeue.`
  },
  {
    id: 25,
    question: "Describe matrix multiplication algorithm and its C implementation outline.",
    answer:
`Matrix multiplication multiplies row of A by column of B. For A (m x p) and B (p x n), result is C (m x n) with C[i][j] = sum_k A[i][k] * B[k][j]. Implementation uses triple nested loops: for i in 0..m-1, for j in 0..n-1, set sum=0, for k in 0..p-1 sum += A[i][k]*B[k][j]; assign C[i][j]=sum. Validate dimensions and initialize result to 0 before sum accumulation.`
  },
  {
    id: 26,
    question: "Explain recursion using factorial example and points where recursion is appropriate.",
    answer:
`Recursion is a function calling itself with smaller inputs. Example factorial(n): if n<=1 return 1; else return n * factorial(n-1). Recursion is elegant for divide-and-conquer problems like tree traversals, quicksort, mergesort, combinatorics. Beware stack depth limits and prefer iterative solutions when performance or memory is a concern. Always ensure base case(s) to terminate recursion.`
  },
  {
    id: 27,
    question: "Explain bubble sort algorithm and its complexity along with an example implementation idea.",
    answer:
`Bubble sort repeatedly steps through the array, compares adjacent pairs and swaps them if out of order; this passes repeatedly until no swaps occur. Complexity is O(n^2) average and worst-case; best-case O(n) when already sorted with a swapped-flag optimization. It's educational but inefficient for large datasets; use it for small arrays or teaching sorting fundamentals.`
  },
  {
    id: 28,
    question: "Explain binary search approach and prerequisites for using it.",
    answer:
`Binary search works on sorted arrays: compare the target with middle element; if equal return; if less search left half; else right half. It requires random-access array and sorted input. Complexity is O(log n). Implement iteratively or recursively; ensure correct mid computation and avoid infinite loops by updating low/high pointers carefully.`
  },
  {
    id: 29,
    question: "Explain how to reverse a linked list and provide the main idea in steps.",
    answer:
`Reversing a singly linked list can be done iteratively by keeping three pointers: prev=NULL, curr=head, next=NULL. While curr != NULL: next = curr->next; curr->next = prev; prev = curr; curr = next. After loop prev points to new head. This is O(n) time and O(1) extra space. It's commonly used to modify order without extra memory.`
  },
  {
    id: 30,
    question: "Describe file handling in C: opening, reading, writing, and closing a file.",
    answer:
`File handling uses FILE* pointers and functions fopen, fclose, fprintf/fprintf, fscanf/fscanf, fgets/fputs, fread/fwrite. Example: FILE *f = fopen("file.txt","r"); check f != NULL; read using fgets or fscanf; write using fprintf; finally fflush/ fclose(f). Always check for NULL on fopen and check return values of IO functions for robustness. Use binary mode (rb/wb) for non-text data.`
  },
];

/* ---------------- notes PDF (public dummy) ---------------- */
const notesPDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

/* ---------------- Component ---------------- */
export default function CourseDetailPage() {
  // Tabs & mode
  const [activeTab, setActiveTab] = useState("quiz"); // "quiz" | "assignment" | "test" | "notes"
  const [isTeacher, setIsTeacher] = useState(false);
  const [answerKeyVisible, setAnswerKeyVisible] = useState(false);

  /* -------- Quiz states (20 MCQs + 30 min timer) -------- */
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(30 * 60); // 30 minutes
  const quizIntervalRef = useRef(null);

  // Start/pause timer when quiz tab active and not submitted
  useEffect(() => {
    if (activeTab === "quiz" && !quizSubmitted) {
      if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
      quizIntervalRef.current = setInterval(() => {
        setQuizSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(quizIntervalRef.current);
            // auto-submit when time ends
            handleQuizSubmit();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
    }
    return () => {
      if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, quizSubmitted]);

  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleQuizChange = (id, value) => {
    setQuizAnswers((p) => ({ ...p, [id]: value }));
  };

  const handleQuizSubmit = () => {
    if (quizSubmitted) return;
    let tempScore = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) tempScore++;
    });
    setQuizScore(tempScore);
    setQuizSubmitted(true);
    // stop timer
    if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
    alert(`Quiz submitted! Your score: ${tempScore}/${quizQuestions.length}`);
  };

  /* -------- Assignment states -------- */
  const [assignmentFiles, setAssignmentFiles] = useState({});

  const handleAssignmentUpload = (id, file) => {
    setAssignmentFiles((p) => ({ ...p, [id]: file }));
  };

  /* -------- Test Paper states -------- */
  const [teacherAnswers, setTeacherAnswers] = useState(() => {
    // combine all test answers into one array (1..30)
    return [
      ...shortQuestions.map((q) => ({ id: q.id, question: q.question, answer: q.answer })),
      ...codingQuestions.map((q) => ({ id: q.id, question: q.question, answer: q.answer })),
      ...longQuestions.map((q) => ({ id: q.id, question: q.question, answer: q.answer })),
    ];
  });

  const [studentAnswers, setStudentAnswers] = useState({}); // id => text
  const [perQuestionResult, setPerQuestionResult] = useState({}); // id => { correct, score }
  const [studentScore, setStudentScore] = useState(null);
  const [testFile, setTestFile] = useState(null);

  const handleStudentAnswerChange = (id, value) => {
    setStudentAnswers((p) => ({ ...p, [id]: value }));
  };

  const handleTestFileUpload = (file) => {
    setTestFile(file);
  };

  const handleSubmitTest = () => {
    // compute per-question correctness
    const results = {};
    let correctCount = 0;
    teacherAnswers.forEach((q) => {
      const { correct, score } = isAnswerCorrectById(studentAnswers[q.id] || "", q.answer || "", q.id);
      results[q.id] = { correct, score };
      if (correct) correctCount++;
    });
    setPerQuestionResult(results);
    setStudentScore(correctCount);
    alert(`Test submitted! Score: ${correctCount}/${teacherAnswers.length}`);
    // hide answer key for students automatically on submit (still if teacher mode stays as is)
    if (!isTeacher) setAnswerKeyVisible(false);
  };

  // Teacher edits an answer in the Answer Key
  const handleEditAnswerKey = (id, newAnswer) => {
    setTeacherAnswers((prev) => prev.map((q) => (q.id === id ? { ...q, answer: newAnswer } : q)));
  };

  const handleSaveAnswerKey = () => {
    // In this frontend-only demo we already update state on edit;
    // we can show a small confirmation message
    alert("Answer key saved (local session).");
  };

  // Ensure students can't toggle Answer Key; hide automatically when switching to test as a student
  useEffect(() => {
    if (!isTeacher) setAnswerKeyVisible(false);
    if (activeTab === "test" && !isTeacher) setAnswerKeyVisible(false);
  }, [activeTab, isTeacher]);

  /* -------- Helpers to render question blocks with color-coded feedback -------- */
  const renderTestQuestionInput = (q) => {
    const res = perQuestionResult[q.id];
    const correct = res?.correct;
    const score = res?.score;
    const containerStyle = correct === undefined
      ? "border p-3 rounded mb-3"
      : correct
        ? "border p-3 rounded mb-3 bg-green-50 border-green-300"
        : "border p-3 rounded mb-3 bg-red-50 border-red-300";

    return (
      <div key={q.id} className={containerStyle}>
        <p className="font-medium mb-2"><strong>Q{q.id}:</strong> {q.question}</p>
        <textarea
          placeholder="Your answer..."
          value={studentAnswers[q.id] || ""}
          onChange={(e) => handleStudentAnswerChange(q.id, e.target.value)}
          className="w-full border rounded px-2 py-2 mb-2"
          rows={q.id >= 11 && q.id <= 20 ? 10 : 5}
        />
        {perQuestionResult[q.id] && (
          <div className="text-sm">
            <span className={`inline-block px-2 py-1 rounded text-white font-semibold ${perQuestionResult[q.id].correct ? 'bg-green-600' : 'bg-red-600'}`}>
              {perQuestionResult[q.id].correct ? "Correct" : "Incorrect"}
            </span>
            <span className="ml-3 text-gray-600">Matching score: {perQuestionResult[q.id].score.toFixed(2)}</span>
            {(!perQuestionResult[q.id].correct || isTeacher) && (
              <div className="mt-2">
                <p className="text-sm font-medium">Answer Key (teacher):</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{teacherAnswers.find(t => t.id === q.id)?.answer}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Course Detail — Sample Static Course</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 mr-2">Mode:</div>
          <button
            onClick={() => setIsTeacher((v) => !v)}
            className={`px-4 py-2 rounded font-medium ${isTeacher ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-800"}`}
            title="Toggle Teacher / Student mode (no auth)"
          >
            {isTeacher ? "Teacher Mode" : "Student Mode"}
          </button>
        </div>
      </div>

      {/* Tabs + Answer Key button (teacher only) */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab("quiz")} className={`px-4 py-2 rounded ${activeTab === "quiz" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>Quiz</button>
        <button onClick={() => setActiveTab("assignment")} className={`px-4 py-2 rounded ${activeTab === "assignment" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>Assignment</button>
        <button onClick={() => setActiveTab("test")} className={`px-4 py-2 rounded ${activeTab === "test" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>Test Paper</button>
        <button onClick={() => setActiveTab("notes")} className={`px-4 py-2 rounded ${activeTab === "notes" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>Notes</button>

        {/* Answer Key button is shown only to teacher */}
        {isTeacher && (
          <button
            onClick={() => setAnswerKeyVisible((v) => !v)}
            className={`ml-4 px-3 py-2 rounded ${answerKeyVisible ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            {answerKeyVisible ? "Hide Answer Key" : "Show Answer Key"}
          </button>
        )}
      </div>

      {/* ---------------- QUIZ ---------------- */}
      {activeTab === "quiz" && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Python MCQ Quiz</h2>
            <div className="text-sm text-gray-700">
              Timer: <span className="font-mono ml-2">{formatTime(quizSecondsLeft)}</span>
            </div>
          </div>

          <div>
            {quizQuestions.map((q) => (
              <div key={q.id} className="mb-4 p-4 border rounded bg-white">
                <p className="font-medium">{q.id}. {q.question}</p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`quiz-${q.id}`}
                        value={opt}
                        disabled={quizSubmitted}
                        checked={quizAnswers[q.id] === opt}
                        onChange={() => handleQuizChange(q.id, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {quizSubmitted && (
                  <p className="mt-2 text-sm">
                    Correct answer: <strong>{q.correct}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <div className="mt-4">
              <button onClick={handleQuizSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded">Submit Quiz</button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="text-lg font-bold">Your Score: {quizScore}/{quizQuestions.length}</div>
            </div>
          )}
        </section>
      )}

      {/* ---------------- ASSIGNMENT ---------------- */}
      {activeTab === "assignment" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Java Assignments</h2>
          {assignmentQuestions.map((q) => (
            <div key={q.id} className="mb-4 p-4 border rounded bg-white">
              <p className="font-medium">{q.id}. {q.question}</p>
              <input
                type="file"
                onChange={(e) => handleAssignmentUpload(q.id, e.target.files[0])}
                className="mt-2"
              />
              {assignmentFiles[q.id] && <p className="text-sm mt-1">Selected: {assignmentFiles[q.id].name}</p>}
            </div>
          ))}
          <div className="mt-3">
            <button
              onClick={() => alert("Assignment files are stored locally in this demo.")}
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              Save Uploads
            </button>
          </div>
        </section>
      )}

      {/* ---------------- TEST PAPER ---------------- */}
      {activeTab === "test" && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">C Programming Test (30 Questions)</h2>
            <div className="text-sm text-gray-600">Answer key is hidden for students while taking test.</div>
          </div>

          {/* Short Qs 1-10 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Short Questions (1–10)</h3>
            {teacherAnswers.filter(q => q.id >= 1 && q.id <= 10).map(renderTestQuestionInput)}
          </div>

          {/* Coding Qs 11-20 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Coding Questions (11–20)</h3>
            {teacherAnswers.filter(q => q.id >= 11 && q.id <= 20).map(renderTestQuestionInput)}
          </div>

          {/* Long Qs 21-30 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Long / Subjective Questions (21–30)</h3>
            {teacherAnswers.filter(q => q.id >= 21 && q.id <= 30).map(renderTestQuestionInput)}
          </div>

          {/* Upload completed test file */}
          <div className="mt-4 mb-4">
            <p className="font-medium mb-2">Upload completed test paper (optional):</p>
            <input type="file" onChange={(e) => handleTestFileUpload(e.target.files[0])} />
            {testFile && <p className="mt-2 text-sm">Uploaded: {testFile.name}</p>}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmitTest} className="px-6 py-2 bg-indigo-600 text-white rounded">Submit Answers</button>
            <button onClick={() => {
              setStudentAnswers({});
              setPerQuestionResult({});
              setStudentScore(null);
            }} className="px-6 py-2 bg-gray-200 rounded">Clear</button>
          </div>

          {studentScore !== null && (
            <div className="mt-4 p-3 rounded bg-white border">
              <h4 className="font-bold">Your Score: {studentScore}/{teacherAnswers.length}</h4>
              <p>Percentage: {((studentScore / teacherAnswers.length) * 100).toFixed(2)}%</p>
            </div>
          )}
        </section>
      )}

      {/* ---------------- NOTES ---------------- */}
      {activeTab === "notes" && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Course Notes</h2>
          <div className="aspect-[16/9] border rounded overflow-hidden">
            {/* iframe to open notes — in dev use a public PDF or public asset */}
            <iframe src={notesPDF} title="Course Notes" className="w-full h-full"></iframe>
          </div>
        </section>
      )}

      {/* ---------------- ANSWER KEY (teacher only, editable) ---------------- */}
      {answerKeyVisible && isTeacher && (
        <section className="mt-6 border p-4 rounded bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Answer Key — Editable (Q1–Q30)</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAnswerKey}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Answer Key
              </button>
              <button
                onClick={() => {
                  setAnswerKeyVisible(false);
                }}
                className="px-3 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {teacherAnswers.map((q) => (
              <div key={q.id} className="p-3 border rounded bg-white">
                <p className="font-medium mb-2">{q.id}. {q.question}</p>
                <textarea
                  rows={q.id >= 11 && q.id <= 20 ? 10 : 6}
                  value={q.answer}
                  onChange={(e) => handleEditAnswerKey(q.id, e.target.value)}
                  className="w-full border rounded px-2 py-2 font-mono text-sm"
                />
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-3">Note: This is frontend-only. Changes persist for the current session only.</p>
        </section>
      )}

      {/* Footer small hint */}
      <div className="mt-8 text-sm text-gray-500">
        Tip: Toggle <strong>Teacher Mode</strong> to view/edit the Answer Key. In Student Mode the Answer Key is hidden while taking the test.
      </div>
    </div>
  );
}
