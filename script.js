const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";
let questions = [];
const quizForm = document.getElementById("quizForm");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const submit = document.getElementById("submit");
const result = document.getElementById("result");
const restart = document.getElementById("restart");
function decodeHTML(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}
async function fetchQuestions() {
    loading.style.display = "block";
    error.style.display = "none";
    quizForm.innerHTML = "";
    result.style.display = "none";
    submit.style.display = "none";
    restart.style.display = "none";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Failed to fetch questions");
        }
        const data = await response.json();
        if (data.response_code !== 0) {
            throw new Error("Quiz questions could not be loaded");
        }
        questions = data.results;
        displayQuestions();
    } catch (err) {
        error.textContent =
            "Unable to load the quiz. Please check your internet connection and try again.";
        error.style.display = "block";
    } finally {
        loading.style.display = "none";
    }
}
function displayQuestions() {
    quizForm.innerHTML = "";
    questions.forEach((question, index) => {
        const card = document.createElement("div");
        card.classList.add("question-card");
        const heading = document.createElement("h3");
        heading.innerHTML =
            `${index + 1}. ${decodeHTML(question.question)}`;
        card.appendChild(heading);
        let options = [
            question.correct_answer,
            ...question.incorrect_answers
        ];
        options.sort(() => Math.random() - 0.5);
        options.forEach((option, optionIndex) => {
            const label = document.createElement("label");
            label.classList.add("option");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `question${index}`;
            input.value = option;
            label.appendChild(input);
            const text = document.createTextNode(
                decodeHTML(option)
            );
            label.appendChild(text);
            card.appendChild(label);
        });
        quizForm.appendChild(card);
    });
    submit.style.display = "block";
}
submit.addEventListener("click", function (event) {
    event.preventDefault();
    let score = 0;
    questions.forEach((question, index) => {
        const selected = document.querySelector(
            `input[name="question${index}"]:checked`
        );
        const options = document.querySelectorAll(
            `input[name="question${index}"]`
        );
        options.forEach(input => {
            const label = input.parentElement;
            label.classList.remove("correct", "incorrect");
            if (input.value === question.correct_answer) {
                label.classList.add("correct");
            }
        });
        if (selected) {
            if (selected.value === question.correct_answer) {
                score++;
            } else {
                selected.parentElement.classList.add("incorrect");
            }
        }
        options.forEach(input => {
            input.disabled = true;
        });
    });
    const percentage = (score / questions.length) * 100;
    result.innerHTML = `
        <h2>Quiz Completed!</h2>
        <p>You scored <strong>${score} / ${questions.length}</strong></p>
        <p>${percentage}%</p>
        <div class="feedback">
            Green = Correct Answer &nbsp; | &nbsp;
            Red = Your Incorrect Answer
        </div>
    `;
    result.style.display = "block";
    submit.style.display = "none";
    restart.style.display = "block";
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
});
restart.addEventListener("click", function () {
    fetchQuestions();
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
fetchQuestions();