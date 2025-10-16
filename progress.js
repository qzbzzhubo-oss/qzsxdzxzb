// 全局变量
let masteredWords = JSON.parse(localStorage.getItem('masteredWords')) || [];
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords')) || [];
let todayLearned = JSON.parse(localStorage.getItem('todayLearned')) || [];
let testResults = JSON.parse(localStorage.getItem('testResults')) || [];

// 成就定义
const achievements = [
    {
        id: 'first_word',
        title: '初次学习',
        description: '掌握第一个单词',
        icon: 'fas fa-seedling',
        color: 'text-green-500',
        condition: () => masteredWords.length >= 1
    },
    {
        id: 'ten_words',
        title: '小有成就',
        description: '掌握10个单词',
        icon: 'fas fa-chart-line',
        color: 'text-blue-500',
        condition: () => masteredWords.length >= 10
    },
    {
        id: 'fifty_words',
        title: '学习达人',
        description: '掌握50个单词',
        icon: 'fas fa-trophy',
        color: 'text-yellow-500',
        condition: () => masteredWords.length >= 50
    },
    {
        id: 'hundred_words',
        title: '词汇大师',
        description: '掌握100个单词',
        icon: 'fas fa-crown',
        color: 'text-purple-500',
        condition: () => masteredWords.length >= 100
    },
    {
        id: 'first_test',
        title: '初试牛刀',
        description: '完成第一次测试',
        icon: 'fas fa-vial',
        color: 'text-red-500',
        condition: () => testResults.length >= 1
    },
    {
        id: 'perfect_score',
        title: '完美表现',
        description: '测试获得满分',
        icon: 'fas fa-medal',
        color: 'text-yellow-400',
        condition: () => testResults.some(result => result.score === 100)
    },
    {
        id: 'favorite_collector',
        title: '收藏达人',
        description: '收藏20个单词',
        icon: 'fas fa-star',
        color: 'text-yellow-500',
        condition: () => favoriteWords.length >= 20
    },
    {
        id: 'daily_learner',
        title: '每日学习',
        description: '今日学习10个单词',
        icon: 'fas fa-calendar-day',
        color: 'text-blue-400',
        condition: () => todayLearned.length >= 10
    },
    {
        id: 'consistent_learner',
        title: '坚持不懈',
        description: '连续学习7天',
        icon: 'fas fa-fire',
        color: 'text-orange-500',
        condition: () => checkConsecutiveDays() >= 7
    },
    {
        id: 'unit_master',
        title: '单元专家',
        description: '完整掌握一个单元的单词',
        icon: 'fas fa-graduation-cap',
        color: 'text-indigo-500',
        condition: () => checkUnitCompletion()
    },
    {
        id: 'speed_learner',
        title: '速学达人',
        description: '一天内掌握20个单词',
        icon: 'fas fa-bolt',
        color: 'text-yellow-600',
        condition: () => checkDailyMastery() >= 20
    },
    {
        id: 'test_regular',
        title: '测试常客',
        description: '完成10次测试',
        icon: 'fas fa-chart-bar',
        color: 'text-green-400',
        condition: () => testResults.length >= 10
    }
];

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateStatistics();
    renderProgressCircle();
    renderUnitProgressChart();
    renderDailyLearningChart();
    renderTestScoreChart();
    renderCategoryChart();
    renderAchievements();
    renderLearningRecords();
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
    setTimeout(() => {
        anime({
            targets: '.stat-card, .chart-container',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 600,
            easing: 'easeOutQuart'
        });
    }, 100);
}

// 设置事件监听器
function setupEventListeners() {
    // 移动端菜单
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
}

// 更新统计信息
function updateStatistics() {
    const totalWords = wordsData.length;
    const masteredCount = masteredWords.length;
    const favoriteCount = favoriteWords.length;
    const todayCount = todayLearned.length;
    
    document.getElementById('total-words-stat').textContent = totalWords;
    document.getElementById('mastered-words-stat').textContent = masteredCount;
    document.getElementById('favorite-words-stat').textContent = favoriteCount;
    document.getElementById('today-words-stat').textContent = todayCount;
    
    // 更新进度相关信息
    const progressPercentage = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
    const remainingWords = totalWords - masteredCount;
    const learningRate = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
    
    document.getElementById('remaining-words').textContent = remainingWords;
    document.getElementById('mastered-percentage').textContent = `${progressPercentage}%`;
    document.getElementById('learning-rate').textContent = `${learningRate}%`;
}

// 渲染进度环形图
function renderProgressCircle() {
    const totalWords = wordsData.length;
    const masteredCount = masteredWords.length;
    const progressPercentage = totalWords > 0 ? (masteredCount / totalWords) * 100 : 0;
    
    const progressCircle = document.getElementById('progress-circle');
    const progressText = document.getElementById('progress-percentage');
    
    // 计算圆周长
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (progressPercentage / 100) * circumference;
    
    // 动画显示进度
    anime({
        targets: progressCircle,
        strokeDashoffset: [circumference, offset],
        duration: 2000,
        easing: 'easeOutQuart'
    });
    
    // 动画显示百分比文字
    anime({
        targets: { value: 0 },
        value: progressPercentage,
        duration: 2000,
        easing: 'easeOutQuart',
        update: function(anim) {
            progressText.textContent = Math.round(anim.animatables[0].target.value) + '%';
        }
    });
}

// 渲染单元进度图表
function renderUnitProgressChart() {
    const unitProgress = {};
    
    // 计算每个单元的进度
    for (let unit = 0; unit <= 14; unit++) {
        const unitWords = wordsData.filter(word => word.unit === unit);
        const masteredUnitWords = unitWords.filter(word => masteredWords.includes(word.id));
        const progress = unitWords.length > 0 ? (masteredUnitWords.length / unitWords.length) * 100 : 0;
        
        unitProgress[unit] = {
            total: unitWords.length,
            mastered: masteredUnitWords.length,
            progress: progress
        };
    }
    
    const units = Object.keys(unitProgress).map(unit => unit === '0' ? '综合' : `Unit ${unit}`);
    const progresses = Object.values(unitProgress).map(data => data.progress);
    
    const data = [{
        x: units,
        y: progresses,
        type: 'bar',
        marker: {
            color: progresses.map(progress => {
                if (progress >= 80) return '#10b981';
                if (progress >= 60) return '#f59e0b';
                if (progress >= 40) return '#3b82f6';
                return '#6b7280';
            })
        },
        text: progresses.map(progress => progress.toFixed(1) + '%'),
        textposition: 'auto'
    }];
    
    const layout = {
        title: '',
        xaxis: { title: '单元' },
        yaxis: { title: '掌握进度 (%)', range: [0, 100] },
        margin: { t: 20, r: 20, b: 60, l: 60 },
        font: { family: 'Noto Sans SC', size: 12 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    const config = { displayModeBar: false, responsive: true };
    
    Plotly.newPlot('unit-progress-chart', data, layout, config);
}

// 渲染每日学习统计图表
function renderDailyLearningChart() {
    // 生成最近7天的数据
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // 从localStorage获取每日学习数据
        const dailyData = JSON.parse(localStorage.getItem(`dailyLearned_${dateStr}`)) || [];
        last7Days.push({
            date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
            count: dailyData.length
        });
    }
    
    const data = [{
        x: last7Days.map(day => day.date),
        y: last7Days.map(day => day.count),
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#3b82f6', width: 3 },
        marker: { color: '#3b82f6', size: 8 }
    }];
    
    const layout = {
        title: '',
        xaxis: { title: '日期' },
        yaxis: { title: '学习单词数' },
        margin: { t: 20, r: 20, b: 60, l: 60 },
        font: { family: 'Noto Sans SC', size: 12 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    const config = { displayModeBar: false, responsive: true };
    
    Plotly.newPlot('daily-learning-chart', data, layout, config);
}

// 渲染测试成绩趋势图表
function renderTestScoreChart() {
    if (testResults.length === 0) {
        document.getElementById('test-score-chart').innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                    <i class="fas fa-chart-line text-4xl mb-4"></i>
                    <p>还没有测试记录</p>
                </div>
            </div>
        `;
        return;
    }
    
    // 获取最近10次测试成绩
    const recentTests = testResults.slice(-10);
    
    const data = [{
        x: recentTests.map((test, index) => `第${index + 1}次`),
        y: recentTests.map(test => test.score),
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#10b981', width: 3 },
        marker: { color: '#10b981', size: 8 }
    }];
    
    const layout = {
        title: '',
        xaxis: { title: '测试次数' },
        yaxis: { title: '成绩 (%)', range: [0, 100] },
        margin: { t: 20, r: 20, b: 60, l: 60 },
        font: { family: 'Noto Sans SC', size: 12 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    const config = { displayModeBar: false, responsive: true };
    
    Plotly.newPlot('test-score-chart', data, layout, config);
}

// 渲染单词分类统计图表
function renderCategoryChart() {
    const categoryStats = {};
    
    // 统计各分类的单词数量
    wordsData.forEach(word => {
        if (!categoryStats[word.category]) {
            categoryStats[word.category] = { total: 0, mastered: 0 };
        }
        categoryStats[word.category].total++;
        if (masteredWords.includes(word.id)) {
            categoryStats[word.category].mastered++;
        }
    });
    
    const categories = Object.keys(categoryStats);
    const totalData = Object.values(categoryStats).map(data => data.total);
    const masteredData = Object.values(categoryStats).map(data => data.mastered);
    
    const data = [
        {
            x: categories,
            y: totalData,
            name: '总数量',
            type: 'bar',
            marker: { color: '#e5e7eb' }
        },
        {
            x: categories,
            y: masteredData,
            name: '已掌握',
            type: 'bar',
            marker: { color: '#3b82f6' }
        }
    ];
    
    const layout = {
        title: '',
        xaxis: { title: '单词分类' },
        yaxis: { title: '单词数量' },
        barmode: 'overlay',
        margin: { t: 20, r: 20, b: 80, l: 60 },
        font: { family: 'Noto Sans SC', size: 12 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        legend: { orientation: 'h', y: -0.2 }
    };
    
    const config = { displayModeBar: false, responsive: true };
    
    Plotly.newPlot('category-chart', data, layout, config);
}

// 渲染成就系统
function renderAchievements() {
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';
    
    achievements.forEach(achievement => {
        const isUnlocked = achievement.condition();
        
        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-badge p-6 rounded-xl border-2 transition-all duration-300 ${
            isUnlocked 
                ? 'bg-white border-yellow-400 shadow-lg' 
                : 'bg-gray-50 border-gray-200 opacity-60'
        }`;
        
        achievementCard.innerHTML = `
            <div class="text-center">
                <div class="mb-4">
                    <i class="${achievement.icon} text-4xl ${isUnlocked ? achievement.color : 'text-gray-400'}"></i>
                </div>
                <h4 class="font-bold text-lg text-gray-900 mb-2">${achievement.title}</h4>
                <p class="text-gray-600 text-sm mb-3">${achievement.description}</p>
                <div class="text-xs ${isUnlocked ? 'text-green-600' : 'text-gray-400'}">
                    ${isUnlocked ? '已解锁' : '未解锁'}
                </div>
            </div>
        `;
        
        container.appendChild(achievementCard);
    });
}

// 渲染学习记录
function renderLearningRecords() {
    const container = document.getElementById('learning-records');
    container.innerHTML = '';
    
    // 获取最近的学习记录
    const recentRecords = [];
    
    // 添加今日学习记录
    if (todayLearned.length > 0) {
        recentRecords.push({
            date: new Date().toLocaleDateString('zh-CN'),
            type: '学习',
            content: `学习了 ${todayLearned.length} 个单词`,
            icon: 'fas fa-book',
            color: 'text-blue-600'
        });
    }
    
    // 添加最近的测试记录
    if (testResults.length > 0) {
        const lastTest = testResults[testResults.length - 1];
        const testDate = new Date(lastTest.date).toLocaleDateString('zh-CN');
        recentRecords.push({
            date: testDate,
            type: '测试',
            content: `${lastTest.type === 'choice' ? '选择题' : '拼写'}测试 - 得分: ${lastTest.score}%`,
            icon: 'fas fa-vial',
            color: lastTest.score >= 80 ? 'text-green-600' : lastTest.score >= 60 ? 'text-yellow-600' : 'text-red-600'
        });
    }
    
    // 添加成就解锁记录
    achievements.forEach(achievement => {
        if (achievement.condition()) {
            recentRecords.push({
                date: '最近',
                type: '成就',
                content: `解锁成就: ${achievement.title}`,
                icon: achievement.icon,
                color: achievement.color
            });
        }
    });
    
    if (recentRecords.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-history text-4xl mb-4"></i>
                <p>暂无学习记录</p>
            </div>
        `;
        return;
    }
    
    // 限制显示最近10条记录
    recentRecords.slice(-10).reverse().forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'flex items-center space-x-4 p-4 bg-gray-50 rounded-lg';
        
        recordItem.innerHTML = `
            <div class="flex-shrink-0">
                <i class="${record.icon} text-xl ${record.color}"></i>
            </div>
            <div class="flex-1">
                <div class="font-medium text-gray-900">${record.content}</div>
                <div class="text-sm text-gray-500">${record.date} · ${record.type}</div>
            </div>
        `;
        
        container.appendChild(recordItem);
    });
}

// 检查连续学习天数
function checkConsecutiveDays() {
    const visitHistory = JSON.parse(localStorage.getItem('visitHistory')) || [];
    const today = new Date().toDateString();
    
    if (!visitHistory.includes(today)) {
        visitHistory.push(today);
        localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
    }
    
    // 计算连续天数
    let consecutiveDays = 0;
    const sortedDates = visitHistory.sort((a, b) => new Date(b) - new Date(a));
    
    for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (currentDate.toDateString() === expectedDate.toDateString()) {
            consecutiveDays++;
        } else {
            break;
        }
    }
    
    return consecutiveDays;
}

// 检查单元完成情况
function checkUnitCompletion() {
    const unitGroups = {};
    
    wordsData.forEach(word => {
        if (!unitGroups[word.unit]) {
            unitGroups[word.unit] = [];
        }
        unitGroups[word.unit].push(word.id);
    });
    
    return Object.values(unitGroups).some(unitWordIds => {
        const masteredInUnit = unitWordIds.filter(id => masteredWords.includes(id));
        return masteredInUnit.length === unitWordIds.length && unitWordIds.length > 0;
    });
}

// 检查每日掌握单词数
function checkDailyMastery() {
    const today = new Date().toDateString();
    const dailyMastery = JSON.parse(localStorage.getItem(`dailyMastery_${today}`)) || [];
    return dailyMastery.length;
}

// 切换移动端菜单
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}