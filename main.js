// 全局变量
let currentPage = 1;
const wordsPerPage = 20;
let filteredWords = [...wordsData];
let masteredWords = JSON.parse(localStorage.getItem('masteredWords')) || [];
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords')) || [];
let todayLearned = JSON.parse(localStorage.getItem('todayLearned')) || [];

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    renderWords();
    updateStatistics();
    updateProgress();
});

// 初始化应用
function initializeApp() {
    // 检查是否是新的一天
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
        todayLearned = [];
        localStorage.setItem('todayLearned', JSON.stringify(todayLearned));
        localStorage.setItem('lastVisit', today);
    }
    
    // 添加页面加载动画
    anime({
        targets: '.word-card',
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // 筛选功能
    document.getElementById('unit-filter').addEventListener('change', handleFilter);
    document.getElementById('category-filter').addEventListener('change', handleFilter);
    document.getElementById('difficulty-filter').addEventListener('change', handleFilter);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // 分页功能
    document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
    document.getElementById('next-page').addEventListener('click', () => changePage(1));
    
    // 移动端菜单
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
    
    // 快速测试按钮
    document.getElementById('quick-test-btn').addEventListener('click', showTestModal);
    document.getElementById('close-test-modal').addEventListener('click', hideTestModal);
    document.getElementById('choice-test-btn').addEventListener('click', () => startTest('choice'));
    document.getElementById('spell-test-btn').addEventListener('click', () => startTest('spell'));
    
    // 点击模态框外部关闭
    document.getElementById('test-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideTestModal();
        }
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 处理搜索
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredWords = [...wordsData];
    } else {
        filteredWords = wordsData.filter(word => 
            word.english.toLowerCase().includes(searchTerm) ||
            word.chinese.includes(searchTerm) ||
            word.phonetic.includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderWords();
    renderPagination();
}

// 处理筛选
function handleFilter() {
    const unitFilter = document.getElementById('unit-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const difficultyFilter = document.getElementById('difficulty-filter').value;
    
    filteredWords = wordsData.filter(word => {
        const matchUnit = !unitFilter || word.unit.toString() === unitFilter;
        const matchCategory = !categoryFilter || word.category === categoryFilter;
        const matchDifficulty = !difficultyFilter || word.difficulty === difficultyFilter;
        
        return matchUnit && matchCategory && matchDifficulty;
    });
    
    currentPage = 1;
    renderWords();
    renderPagination();
}

// 重置筛选
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('unit-filter').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('difficulty-filter').value = '';
    
    filteredWords = [...wordsData];
    currentPage = 1;
    renderWords();
    renderPagination();
}

// 渲染单词
function renderWords() {
    const container = document.getElementById('words-container');
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    const wordsToShow = filteredWords.slice(startIndex, endIndex);
    
    container.innerHTML = '';
    
    if (wordsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-medium text-gray-500 mb-2">未找到匹配的单词</h3>
                <p class="text-gray-400">尝试调整搜索条件或筛选器</p>
            </div>
        `;
        return;
    }
    
    wordsToShow.forEach((word, index) => {
        const wordCard = createWordCard(word, startIndex + index);
        container.appendChild(wordCard);
    });
    
    // 添加进入动画
    anime({
        targets: '.word-card',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 500,
        easing: 'easeOutQuart'
    });
    
    renderPagination();
}

// 创建单词卡片
function createWordCard(word, index) {
    const card = document.createElement('div');
    const isMastered = masteredWords.includes(word.id);
    const isFavorite = favoriteWords.includes(word.id);
    
    card.className = `word-card bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 ${isMastered ? 'border-green-300' : ''}`;
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div class="flex items-center space-x-3">
                <span class="text-2xl font-bold text-gray-900 font-['Inter']">${word.english}</span>
                <button class="pronunciation-btn text-blue-600 hover:text-blue-800" onclick="speakWord('${word.english}')">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
            <div class="flex space-x-2">
                <button class="text-gray-400 hover:text-yellow-500 transition-colors duration-200 ${isFavorite ? 'favorite' : ''}" 
                        onclick="toggleFavorite(${word.id})" title="收藏">
                    <i class="fas fa-star"></i>
                </button>
                <button class="text-gray-400 hover:text-green-500 transition-colors duration-200 ${isMastered ? 'text-green-500' : ''}" 
                        onclick="toggleMastered(${word.id})" title="已掌握">
                    <i class="fas fa-check-circle"></i>
                </button>
            </div>
        </div>
        
        <div class="mb-3">
            <span class="text-gray-600 font-['Inter']">${word.phonetic}</span>
        </div>
        
        <div class="mb-4">
            <p class="text-gray-800 text-lg">${word.chinese}</p>
        </div>
        
        <div class="flex justify-between items-center text-sm text-gray-500">
            <div class="flex space-x-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Unit ${word.unit || '综合'}</span>
                <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">${word.category}</span>
            </div>
            <span class="px-2 py-1 ${getDifficultyColor(word.difficulty)} rounded-full">
                ${getDifficultyText(word.difficulty)}
            </span>
        </div>
    `;
    
    return card;
}

// 获取难度颜色
function getDifficultyColor(difficulty) {
    switch (difficulty) {
        case 'easy': return 'bg-green-100 text-green-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'hard': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// 获取难度文本
function getDifficultyText(difficulty) {
    switch (difficulty) {
        case 'easy': return '简单';
        case 'medium': return '中等';
        case 'hard': return '困难';
        default: return '未知';
    }
}

// 语音发音功能
function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        // 停止当前播放
        speechSynthesis.cancel();
        
        // 播放新语音
        speechSynthesis.speak(utterance);
        
        // 添加到今日学习记录
        addToTodayLearned(word);
    } else {
        alert('您的浏览器不支持语音功能');
    }
}

// 添加到今日学习记录
function addToTodayLearned(word) {
    if (!todayLearned.includes(word)) {
        todayLearned.push(word);
        localStorage.setItem('todayLearned', JSON.stringify(todayLearned));
        updateStatistics();
    }
}

// 切换掌握状态
function toggleMastered(wordId) {
    const index = masteredWords.indexOf(wordId);
    if (index > -1) {
        masteredWords.splice(index, 1);
    } else {
        masteredWords.push(wordId);
    }
    
    localStorage.setItem('masteredWords', JSON.stringify(masteredWords));
    renderWords();
    updateStatistics();
    updateProgress();
}

// 切换收藏状态
function toggleFavorite(wordId) {
    const index = favoriteWords.indexOf(wordId);
    if (index > -1) {
        favoriteWords.splice(index, 1);
    } else {
        favoriteWords.push(wordId);
    }
    
    localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));
    renderWords();
    updateStatistics();
}

// 渲染分页
function renderPagination() {
    const totalPages = Math.ceil(filteredWords.length / wordsPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    pageNumbers.innerHTML = '';
    
    if (totalPages <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }
    
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    
    // 显示页码
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `px-4 py-2 rounded-lg transition-colors duration-200 ${
            i === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(pageBtn);
    }
    
    // 更新按钮状态
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// 跳转到指定页面
function goToPage(page) {
    currentPage = page;
    renderWords();
    
    // 滚动到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 改变页面
function changePage(direction) {
    const totalPages = Math.ceil(filteredWords.length / wordsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        goToPage(newPage);
    }
}

// 更新统计信息
function updateStatistics() {
    document.getElementById('total-words').textContent = wordsData.length;
    document.getElementById('mastered-words').textContent = masteredWords.length;
    document.getElementById('favorite-words').textContent = favoriteWords.length;
    document.getElementById('today-words').textContent = todayLearned.length;
}

// 更新进度条
function updateProgress() {
    const progress = (masteredWords.length / wordsData.length) * 100;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${masteredWords.length}/${wordsData.length} 已掌握`;
}

// 切换移动端菜单
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

// 显示测试模态框
function showTestModal() {
    const modal = document.getElementById('test-modal');
    modal.classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 隐藏测试模态框
function hideTestModal() {
    const modal = document.getElementById('test-modal');
    
    // 添加隐藏动画
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
            modal.classList.add('hidden');
        }
    });
}

// 开始测试
function startTest(type) {
    hideTestModal();
    
    // 根据测试类型跳转到相应页面
    if (type === 'choice') {
        window.location.href = 'test.html?mode=choice';
    } else if (type === 'spell') {
        window.location.href = 'test.html?mode=spell';
    }
}

// 导出函数供HTML使用
window.speakWord = speakWord;
window.toggleMastered = toggleMastered;
window.toggleFavorite = toggleFavorite;