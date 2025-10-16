// 全局变量
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords')) || [];
let masteredWords = JSON.parse(localStorage.getItem('masteredWords')) || [];
let filteredFavorites = [];

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    renderFavorites();
    updateStatistics();
});

// 初始化应用
function initializeApp() {
    filteredFavorites = getFavoriteWords();
    
    // 添加页面加载动画
    if (filteredFavorites.length > 0) {
        setTimeout(() => {
            anime({
                targets: '.word-card',
                translateY: [50, 0],
                opacity: [0, 1],
                delay: anime.stagger(100),
                duration: 600,
                easing: 'easeOutQuart'
            });
        }, 100);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    document.getElementById('search-favorites').addEventListener('input', debounce(handleSearch, 300));
    
    // 操作按钮
    document.getElementById('test-favorites-btn').addEventListener('click', testFavorites);
    document.getElementById('clear-favorites-btn').addEventListener('click', showClearConfirm);
    document.getElementById('export-favorites-btn').addEventListener('click', exportFavorites);
    
    // 确认对话框
    document.getElementById('confirm-clear').addEventListener('click', clearFavorites);
    document.getElementById('cancel-clear').addEventListener('click', hideClearConfirm);
    
    // 移动端菜单
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
    
    // 点击模态框外部关闭
    document.getElementById('confirm-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideClearConfirm();
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

// 获取收藏的单词
function getFavoriteWords() {
    return wordsData.filter(word => favoriteWords.includes(word.id));
}

// 处理搜索
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredFavorites = getFavoriteWords();
    } else {
        const allFavorites = getFavoriteWords();
        filteredFavorites = allFavorites.filter(word => 
            word.english.toLowerCase().includes(searchTerm) ||
            word.chinese.includes(searchTerm) ||
            word.phonetic.includes(searchTerm)
        );
    }
    
    renderFavorites();
}

// 渲染收藏的单词
function renderFavorites() {
    const container = document.getElementById('favorites-container');
    const emptyState = document.getElementById('empty-state');
    
    if (filteredFavorites.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    container.innerHTML = '';
    
    filteredFavorites.forEach((word, index) => {
        const wordCard = createFavoriteCard(word, index);
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
}

// 创建收藏单词卡片
function createFavoriteCard(word, index) {
    const card = document.createElement('div');
    const isMastered = masteredWords.includes(word.id);
    
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
                <button class="text-yellow-500 hover:text-yellow-600 transition-colors duration-200" 
                        onclick="removeFavorite(${word.id})" title="取消收藏">
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
        
        ${isMastered ? `
        <div class="mt-4 p-3 bg-green-50 rounded-lg">
            <div class="flex items-center text-green-700">
                <i class="fas fa-check-circle mr-2"></i>
                <span class="font-medium">已掌握</span>
            </div>
        </div>
        ` : ''}
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
        
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    } else {
        alert('您的浏览器不支持语音功能');
    }
}

// 移除收藏
function removeFavorite(wordId) {
    const index = favoriteWords.indexOf(wordId);
    if (index > -1) {
        favoriteWords.splice(index, 1);
        localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));
        
        // 重新获取过滤后的收藏列表
        filteredFavorites = getFavoriteWords();
        
        // 重新渲染
        renderFavorites();
        updateStatistics();
        
        // 显示移除动画
        const cards = document.querySelectorAll('.word-card');
        const targetCard = Array.from(cards).find(card => 
            card.innerHTML.includes(`removeFavorite(${wordId})`)
        );
        
        if (targetCard) {
            anime({
                targets: targetCard,
                scale: [1, 0],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    renderFavorites();
                }
            });
        }
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
    renderFavorites();
    updateStatistics();
}

// 更新统计信息
function updateStatistics() {
    const totalFavorites = favoriteWords.length;
    const masteredFavorites = favoriteWords.filter(id => masteredWords.includes(id)).length;
    const notMasteredFavorites = totalFavorites - masteredFavorites;
    const progressPercentage = totalFavorites > 0 ? Math.round((masteredFavorites / totalFavorites) * 100) : 0;
    
    document.getElementById('total-favorites').textContent = totalFavorites;
    document.getElementById('mastered-favorites').textContent = masteredFavorites;
    document.getElementById('not-mastered-favorites').textContent = notMasteredFavorites;
    document.getElementById('favorite-progress').textContent = `${progressPercentage}%`;
}

// 测试收藏的单词
function testFavorites() {
    if (favoriteWords.length === 0) {
        alert('你还没有收藏任何单词');
        return;
    }
    
    window.location.href = 'test.html?mode=choice';
}

// 显示清空确认对话框
function showClearConfirm() {
    if (favoriteWords.length === 0) {
        alert('你还没有收藏任何单词');
        return;
    }
    
    const modal = document.getElementById('confirm-modal');
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

// 隐藏清空确认对话框
function hideClearConfirm() {
    const modal = document.getElementById('confirm-modal');
    
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

// 清空收藏
function clearFavorites() {
    favoriteWords = [];
    localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));
    
    filteredFavorites = [];
    hideClearConfirm();
    
    // 添加清空动画
    const cards = document.querySelectorAll('.word-card');
    anime({
        targets: cards,
        scale: [1, 0],
        opacity: [1, 0],
        delay: anime.stagger(50),
        duration: 300,
        easing: 'easeInQuart',
        complete: () => {
            renderFavorites();
            updateStatistics();
        }
    });
}

// 导出收藏
function exportFavorites() {
    if (favoriteWords.length === 0) {
        alert('你还没有收藏任何单词');
        return;
    }
    
    const favoriteWordsData = wordsData.filter(word => favoriteWords.includes(word.id));
    
    // 创建CSV格式数据
    let csvContent = "英文,音标,中文,单元,分类,难度\n";
    favoriteWordsData.forEach(word => {
        csvContent += `"${word.english}","${word.phonetic}","${word.chinese}","${word.unit || '综合'}","${word.category}","${getDifficultyText(word.difficulty)}"\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `收藏的单词_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 显示导出成功提示
    showExportSuccess();
}

// 显示导出成功提示
function showExportSuccess() {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-check-circle"></i>
            <span>导出成功！</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // 添加显示动画
    anime({
        targets: toast,
        translateX: [100, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    // 3秒后自动消失
    setTimeout(() => {
        anime({
            targets: toast,
            translateX: [0, 100],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
                document.body.removeChild(toast);
            }
        });
    }, 3000);
}

// 切换移动端菜单
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}