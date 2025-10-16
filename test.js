// 全局变量
let currentTestType = '';
let currentQuestionIndex = 0;
let testQuestions = [];
let userAnswers = [];
let testWords = [];
let questionCount = 10;

// 获取本地存储数据
let masteredWords = JSON.parse(localStorage.getItem('masteredWords')) || [];
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords')) || [];

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkURLParams();
});

// 设置事件监听器
function setupEventListeners() {
    // 测试选择按钮
    document.getElementById('start-choice-test').addEventListener('click', () => startTest('choice'));
    document.getElementById('start-spell-test').addEventListener('click', () => startTest('spell'));
    
    // 测试范围选择
    document.getElementById('test-range').addEventListener('change', handleTestRangeChange);
    
    // 题目数量选择
    document.getElementById('question-count').addEventListener('change', handleQuestionCountChange);
    
    // 测试界面按钮
    document.getElementById('pronunciation-btn').addEventListener('click', playCurrentWord);
    document.getElementById('spell-pronunciation-btn').addEventListener('click', playCurrentWord);
    document.getElementById('check-spell').addEventListener('click', checkSpelling);
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('next-spell-question').addEventListener('click', nextQuestion);
    
    // 拼写输入框
    document.getElementById('spell-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkSpelling();
        }
    });
    
    // 结果界面按钮
    document.getElementById('retake-test').addEventListener('click', retakeTest);
    document.getElementById('back-to-learn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // 移动端菜单
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
}

// 检查URL参数
function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'choice' || mode === 'spell') {
        startTest(mode);
    }
}

// 处理测试范围变化
function handleTestRangeChange(e) {
    const unitSelectContainer = document.getElementById('unit-select-container');
    if (e.target.value === 'unit') {
        unitSelectContainer.classList.remove('hidden');
    } else {
        unitSelectContainer.classList.add('hidden');
    }
}

// 处理题目数量变化
function handleQuestionCountChange(e) {
    questionCount = parseInt(e.target.value);
}

// 开始测试
function startTest(type) {
    currentTestType = type;
    currentQuestionIndex = 0;
    userAnswers = [];
    
    // 获取测试单词
    testWords = getTestWords();
    
    if (testWords.length < questionCount) {
        alert(`选择的范围内只有 ${testWords.length} 个单词，不足 ${questionCount} 题`);
        return;
    }
    
    // 随机选择题目
    testQuestions = shuffleArray(testWords).slice(0, questionCount);
    
    // 显示测试界面
    document.getElementById('test-selection').classList.add('hidden');
    document.getElementById('test-interface').classList.remove('hidden');
    
    if (type === 'choice') {
        document.getElementById('choice-test').classList.remove('hidden');
        document.getElementById('spell-test').classList.add('hidden');
        showChoiceQuestion();
    } else if (type === 'spell') {
        document.getElementById('choice-test').classList.add('hidden');
        document.getElementById('spell-test').classList.remove('hidden');
        showSpellQuestion();
    }
    
    updateProgress();
}

// 获取测试单词
function getTestWords() {
    const testRange = document.getElementById('test-range').value;
    
    switch (testRange) {
        case 'mastered':
            return wordsData.filter(word => masteredWords.includes(word.id));
        case 'favorite':
            return wordsData.filter(word => favoriteWords.includes(word.id));
        case 'unit':
            const unit = document.getElementById('unit-select').value;
            return wordsData.filter(word => word.unit.toString() === unit);
        default:
            return wordsData;
    }
}

// 显示选择题
function showChoiceQuestion() {
    const currentWord = testQuestions[currentQuestionIndex];
    
    document.getElementById('current-word').textContent = currentWord.english;
    document.getElementById('current-phonetic').textContent = currentWord.phonetic;
    
    // 生成选项
    const options = generateOptions(currentWord);
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left';
        button.textContent = option.chinese;
        button.addEventListener('click', () => selectOption(index, button, option.id === currentWord.id));
        optionsContainer.appendChild(button);
    });
    
    // 重置下一题按钮
    const nextBtn = document.getElementById('next-question');
    nextBtn.disabled = true;
    nextBtn.className = 'px-8 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed';
    
    // 添加进入动画
    anime({
        targets: '.option-btn',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 400,
        easing: 'easeOutQuart'
    });
}

// 生成选项
function generateOptions(correctWord) {
    const options = [correctWord];
    const otherWords = wordsData.filter(word => word.id !== correctWord.id);
    const shuffledOthers = shuffleArray(otherWords);
    
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
        options.push(shuffledOthers[i]);
    }
    
    return shuffleArray(options);
}

// 选择选项
function selectOption(selectedIndex, button, isCorrect) {
    // 禁用所有选项
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach((btn, index) => {
        btn.disabled = true;
        if (index === selectedIndex) {
            btn.className += isCorrect ? ' correct' : ' incorrect';
        } else if (testQuestions[currentQuestionIndex].id === getWordIdFromOption(btn)) {
            btn.className += ' correct';
        }
    });
    
    // 记录答案
    userAnswers.push({
        word: testQuestions[currentQuestionIndex],
        selected: selectedIndex,
        correct: isCorrect
    });
    
    // 启用下一题按钮
    const nextBtn = document.getElementById('next-question');
    nextBtn.disabled = false;
    nextBtn.className = 'px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200';
}

// 从选项按钮获取单词ID
function getWordIdFromOption(button) {
    const options = document.querySelectorAll('.option-btn');
    const index = Array.from(options).indexOf(button);
    const currentWord = testQuestions[currentQuestionIndex];
    const allOptions = generateOptions(currentWord);
    return allOptions[index].id;
}

// 显示拼写题
function showSpellQuestion() {
    const currentWord = testQuestions[currentQuestionIndex];
    
    document.getElementById('spell-hint').textContent = currentWord.chinese;
    document.getElementById('spell-input').value = '';
    document.getElementById('spell-input').focus();
    
    // 重置按钮状态
    document.getElementById('check-spell').disabled = false;
    document.getElementById('check-spell').className = 'px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200';
    
    const nextBtn = document.getElementById('next-spell-question');
    nextBtn.disabled = true;
    nextBtn.className = 'px-8 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed ml-4';
    
    // 自动播放发音
    setTimeout(() => {
        playCurrentWord();
    }, 500);
}

// 检查拼写
function checkSpelling() {
    const userInput = document.getElementById('spell-input').value.trim().toLowerCase();
    const currentWord = testQuestions[currentQuestionIndex];
    const isCorrect = userInput === currentWord.english.toLowerCase();
    
    // 记录答案
    userAnswers.push({
        word: currentWord,
        userInput: userInput,
        correct: isCorrect
    });
    
    // 显示结果
    const input = document.getElementById('spell-input');
    if (isCorrect) {
        input.className = 'w-full px-4 py-3 text-xl text-center border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-[\'Inter\'] bg-green-50';
    } else {
        input.className = 'w-full px-4 py-3 text-xl text-center border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-[\'Inter\'] bg-red-50';
        // 显示正确答案
        setTimeout(() => {
            input.value = currentWord.english;
            input.className = 'w-full px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg font-[\'Inter\'] bg-gray-100';
        }, 1000);
    }
    
    // 禁用输入和检查按钮
    input.disabled = true;
    document.getElementById('check-spell').disabled = true;
    document.getElementById('check-spell').className = 'px-8 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed';
    
    // 启用下一题按钮
    const nextBtn = document.getElementById('next-spell-question');
    nextBtn.disabled = false;
    nextBtn.className = 'px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 ml-4';
}

// 播放当前单词发音
function playCurrentWord() {
    if (currentQuestionIndex < testQuestions.length) {
        const currentWord = testQuestions[currentQuestionIndex];
        speakWord(currentWord.english);
    }
}

// 下一题
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= testQuestions.length) {
        showResults();
    } else {
        updateProgress();
        
        if (currentTestType === 'choice') {
            showChoiceQuestion();
        } else if (currentTestType === 'spell') {
            showSpellQuestion();
        }
    }
}

// 更新进度
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questionCount) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${currentQuestionIndex + 1}/${questionCount}`;
}

// 显示结果
function showResults() {
    document.getElementById('test-interface').classList.add('hidden');
    document.getElementById('test-result').classList.remove('hidden');
    
    const correctCount = userAnswers.filter(answer => answer.correct).length;
    const wrongCount = userAnswers.length - correctCount;
    const scorePercentage = Math.round((correctCount / userAnswers.length) * 100);
    
    // 更新统计数据
    document.getElementById('total-questions').textContent = userAnswers.length;
    document.getElementById('correct-answers').textContent = correctCount;
    document.getElementById('wrong-answers').textContent = wrongCount;
    document.getElementById('score-text').textContent = `${scorePercentage}%`;
    
    // 更新结果消息
    const resultMessage = document.getElementById('result-message');
    if (scorePercentage >= 90) {
        resultMessage.textContent = '太棒了！你的表现非常出色！';
        resultMessage.className = 'text-green-600 text-lg';
    } else if (scorePercentage >= 70) {
        resultMessage.textContent = '不错的成绩，继续加油！';
        resultMessage.className = 'text-blue-600 text-lg';
    } else if (scorePercentage >= 60) {
        resultMessage.textContent = '还需要继续努力哦！';
        resultMessage.className = 'text-yellow-600 text-lg';
    } else {
        resultMessage.textContent = '不要灰心，多练习会更好！';
        resultMessage.className = 'text-red-600 text-lg';
    }
    
    // 显示错误单词
    const wrongAnswers = userAnswers.filter(answer => !answer.correct);
    if (wrongAnswers.length > 0) {
        document.getElementById('wrong-words').classList.remove('hidden');
        const wrongWordsList = document.getElementById('wrong-words-list');
        wrongWordsList.innerHTML = '';
        
        wrongAnswers.forEach(answer => {
            const wordItem = document.createElement('div');
            wordItem.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
            wordItem.innerHTML = `
                <div>
                    <span class="font-bold text-gray-900 font-['Inter']">${answer.word.english}</span>
                    <span class="text-gray-600 ml-2">${answer.word.phonetic}</span>
                </div>
                <div class="text-gray-700">${answer.word.chinese}</div>
            `;
            wrongWordsList.appendChild(wordItem);
        });
    }
    
    // 动画显示分数圆环
    const scoreCircle = document.getElementById('score-circle');
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (scorePercentage / 100) * circumference;
    
    anime({
        targets: scoreCircle,
        strokeDashoffset: [circumference, offset],
        duration: 1500,
        easing: 'easeOutQuart'
    });
    
    // 保存测试结果
    saveTestResult(scorePercentage, correctCount, wrongCount);
}

// 保存测试结果
function saveTestResult(score, correct, wrong) {
    const testResults = JSON.parse(localStorage.getItem('testResults')) || [];
    const result = {
        date: new Date().toISOString(),
        type: currentTestType,
        score: score,
        correct: correct,
        wrong: wrong,
        total: userAnswers.length
    };
    
    testResults.push(result);
    localStorage.setItem('testResults', JSON.stringify(testResults));
}

// 重新测试
function retakeTest() {
    document.getElementById('test-result').classList.add('hidden');
    document.getElementById('test-selection').classList.remove('hidden');
    
    // 重置所有状态
    currentQuestionIndex = 0;
    testQuestions = [];
    userAnswers = [];
}

// 语音发音功能
function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    } else {
        alert('您的浏览器不支持语音功能');
    }
}

// 数组洗牌函数
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 切换移动端菜单
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}