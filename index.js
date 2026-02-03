(function scheduleDailyTasks() {
  // 配置区
  const TOKEN = ""; // 在此填入你的 Bearer token

  const TARGET_HOUR = 6;
  const TARGET_MINUTE_START = 50;

  // 工具函数
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const formatTime = (date) => date.toLocaleTimeString('zh-CN', { hour12: false });

  // 生成有零有整的随机毫秒数 (分钟转毫秒，带随机秒数)
  // 例如：2分17秒 = 137000ms
  const randomIntervalMs = (minMinutes, maxMinutes) => {
    const minutes = randomInt(minMinutes, maxMinutes);
    const seconds = randomInt(0, 59);
    return (minutes * 60 + seconds) * 1000;
  };

  // 计算下一个6:50-7:00的随机时间点
  const getNextRandomTime = () => {
    const now = new Date();
    const todayDeadline = new Date(now);
    todayDeadline.setHours(7, 0, 0, 0);

    let targetDate = new Date(now);

    if (now >= todayDeadline) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    targetDate.setHours(TARGET_HOUR, TARGET_MINUTE_START, 0, 0);
    const randomSeconds = randomInt(0, 600);
    targetDate.setSeconds(randomSeconds);

    return targetDate;
  };

  // ==================== 任务1：课程成绩获取 ====================
  async function fetchCourseScoresWithInterval() {
    const results = [];
    const startId = 92;
    const endId = 109;
    const totalCourses = endId - startId + 1; // 18个课程！

    // 课程间隔：1分30秒 - 2分45秒 (有零有整)
    const getCourseInterval = () => randomIntervalMs(1, 2) + randomInt(0, 1) * 15000; // 90-165秒

    const headers = {
      "accept": "application/json",
      "authorization": TOKEN,
      "content-type": "application/json",
      "referrer": "https://fit.shangbanzugroup.com/h5/"
    };

    console.log(`\n📚 [${formatTime(new Date())}] 开始执行：课程成绩获取`);
    console.log(`   课程范围: ${startId}-${endId} (共${totalCourses}个)`);
    console.log(`   间隔时间: 1分30秒 - 2分45秒 (随机)`);

    for (let courseId = startId; courseId <= endId; courseId++) {
      try {
        const response = await fetch("https://fit.shangbanzugroup.com/front/v1/course/score", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ courseId }),
          credentials: "include"
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        results.push({ courseId, success: true, data });
        console.log(`   ✅ Course ${courseId} 完成`);

      } catch (err) {
        results.push({ courseId, success: false, error: err.message });
        console.error(`   ❌ Course ${courseId} 失败:`, err.message);
      }

      if (courseId < endId) {
        const interval = getCourseInterval();
        const intervalSec = Math.floor(interval / 1000);
        const min = Math.floor(intervalSec / 60);
        const sec = intervalSec % 60;
        console.log(`   ⏳ 等待 ${min}分${sec}秒...`);
        await sleep(interval);
      }
    }

    console.log(`   🎉 课程任务完成！成功: ${results.filter(r => r.success).length}/${totalCourses}`);
    return results;
  }

  // ==================== 任务2：运动数据提交 ====================
  async function submitExercisesWithInterval() {
    const exerciseConfigs = [
      { type: 'jump-rope', name: '跳绳', countRange: [100, 168], durationRange: [92, 156] },
      { type: 'crunch', name: '卷腹', countRange: [20, 47], durationRange: [38, 86] },
      { type: 'high-knee', name: '高抬腿', countRange: [100, 157], durationRange: [78, 134] },
      { type: 'push-up', name: '俯卧撑', countRange: [20, 41], durationRange: [54, 97] },
      { type: 'jumping-jack', name: '开合跳', countRange: [30, 67], durationRange: [41, 79] },
      { type: 'squat-up', name: '深蹲', countRange: [30, 53], durationRange: [58, 96] },
      { type: 'sit-up', name: '仰卧起坐', countRange: [30, 52], durationRange: [61, 99] },
      { type: 'plank', name: '平板支撑', countRange: [0, 0], durationRange: [124, 187] }
    ];

    const headers = {
      "accept": "application/json",
      "authorization": TOKEN,
      "content-type": "application/json",
      "referrer": "https://fit.shangbanzugroup.com/h5/"
    };

    const exercises = exerciseConfigs.map(cfg => ({
      ...cfg,
      actualCount: cfg.type === 'plank' ? 0 : randomInt(...cfg.countRange),
      actualDuration: randomInt(...cfg.durationRange)
    }));

    // 运动间隔：8分20秒 - 11分50秒 (有零有整)
    const getExerciseInterval = () => randomIntervalMs(8, 11);

    const results = [];

    console.log(`\n🏋️ [${formatTime(new Date())}] 开始执行：运动数据提交`);
    console.log(`   共${exercises.length}项运动`);
    console.log(`   间隔时间: 8分20秒 - 11分50秒 (随机)`);

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const remark = ex.type === 'plank'
        ? `性别男，体重65kg，身高175cm，${ex.name}${ex.actualDuration}秒，计时运动，`
        : `性别男，体重65kg，身高175cm，${ex.name}${ex.actualDuration}秒，计数${ex.actualCount}个，`;

      try {
        const response = await fetch("https://fit.shangbanzugroup.com/front/v1/fit-record", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            type: ex.type,
            count: ex.actualCount,
            duration: ex.actualDuration,
            remark
          }),
          credentials: "include"
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        results.push({ name: ex.name, success: true, data });
        console.log(`   ✅ ${ex.name} 完成`);

      } catch (err) {
        results.push({ name: ex.name, success: false, error: err.message });
        console.error(`   ❌ ${ex.name} 失败:`, err.message);
      }

      if (i < exercises.length - 1) {
        const interval = getExerciseInterval();
        const intervalSec = Math.floor(interval / 1000);
        const min = Math.floor(intervalSec / 60);
        const sec = intervalSec % 60;
        console.log(`   ⏳ 等待 ${min}分${sec}秒...`);
        await sleep(interval);
      }
    }

    console.log(`   🎉 运动任务完成！成功: ${results.filter(r => r.success).length}/${exercises.length}`);
    return results;
  }

  // ==================== 定时调度 ====================
  const scheduleNext = () => {
    const nextTime = getNextRandomTime();
    const now = new Date();
    const waitMs = nextTime - now;

    console.log(`\n⏰ 定时器已启动`);
    console.log(`📅 下次执行日期: ${nextTime.toLocaleDateString('zh-CN')}`);
    console.log(`⏰ 随机执行时间: ${formatTime(nextTime)} (6:50-7:00之间随机)`);
    console.log(`📋 执行任务: 课程成绩获取(18个) + 运动数据提交(8项)`);
    console.log(`⏳ 距离执行还有: ${Math.floor(waitMs / 60000)}分${Math.floor((waitMs % 60000) / 1000)}秒`);
    console.log(`💡 提示: 请保持浏览器打开，可以最小化但不要关闭此标签页\n`);

    setTimeout(async () => {
      console.log(`\n🚀 [${formatTime(new Date())}] 到达执行时间，两个任务同时启动！`);

      const [courseResults, exerciseResults] = await Promise.all([
        fetchCourseScoresWithInterval().catch(err => {
          console.error('课程任务异常:', err);
          return [];
        }),
        submitExercisesWithInterval().catch(err => {
          console.error('运动任务异常:', err);
          return [];
        })
      ]);

      const courseSuccess = courseResults.filter(r => r.success).length;
      const exerciseSuccess = exerciseResults.filter(r => r.success).length;

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎉 [${formatTime(new Date())}] 今日所有任务执行完毕！`);
      console.log(`📚 课程: ${courseSuccess}/18 成功`);
      console.log(`🏋️ 运动: ${exerciseSuccess}/8 成功`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      scheduleNext();
    }, waitMs);
  };

  scheduleNext();
})();
