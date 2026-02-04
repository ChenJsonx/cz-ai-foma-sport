// ==================== 课程成绩获取（修正版）====================
(function courseScoreFetcher() {
  // 防重复执行
  if (window.__courseFetcherRunning) {
    console.log('⚠️ 课程任务已在运行，请勿重复启动');
    return;
  }
  window.__courseFetcherRunning = true;

  const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // ✅ 填入实际Token
  
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const formatTime = (date) => date.toLocaleTimeString('zh-CN', { hour12: false });
  
  // ✅ 修正：参数改为秒，更清晰
  const randomIntervalMs = (minSeconds, maxSeconds) => {
    const seconds = randomInt(minSeconds, maxSeconds);
    return seconds * 1000;
  };

  const results = [];
  const startId = 92;
  const endId = 109;
  const totalCourses = endId - startId + 1;
  
  // ✅ 修正：明确指定 90-165秒（1分30秒-2分45秒）
  const getCourseInterval = () => randomIntervalMs(90, 165);

  const headers = {
    "accept": "application/json",
    "authorization": TOKEN,
    "content-type": "application/json",
    "referrer": "https://fit.shangbanzugroup.com/h5/" // ✅ 去掉空格
  };

  console.log(`\n📚 [${formatTime(new Date())}] 开始执行：课程成绩获取`);
  console.log(`   课程范围: ${startId}-${endId} (共${totalCourses}个)`);
  console.log(`   间隔时间: 1分30秒 - 2分45秒 (随机)`);

  (async () => {
    for (let courseId = startId; courseId <= endId; courseId++) {
      try {
        const response = await fetch("https://fit.shangbanzugroup.com/front/v1/course/score", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ courseId }),
          credentials: "include"
        });
        
        if (!response.ok) {
          // ✅ Token 过期检测
          if (response.status === 401 || response.status === 403) {
            console.error(`🔴 Token 已过期，请更新后重试`);
            break;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        // ✅ 安全解析 JSON
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        results.push({ courseId, success: true, data });
        console.log(`   ✅ Course ${courseId} 完成`);
        
      } catch (err) {
        results.push({ courseId, success: false, error: err.message });
        console.error(`   ❌ Course ${courseId} 失败:`, err.message);
      }
      
      if (courseId < endId) {
        const intervalMs = getCourseInterval();
        const min = Math.floor(intervalMs / 60000);
        const sec = Math.floor((intervalMs % 60000) / 1000);
        console.log(`   ⏳ 等待 ${min}分${sec}秒...`);
        await sleep(intervalMs);
      }
    }
    
    console.log(`\n🎉 课程任务完成！成功: ${results.filter(r => r.success).length}/${totalCourses}`);
    window.__courseFetcherRunning = false;
    return results;
  })();
})();

// ==================== 运动数据提交（修正版）====================
(function exerciseSubmitter() {
  if (window.__exerciseSubmitterRunning) {
    console.log('⚠️ 运动任务已在运行，请勿重复启动');
    return;
  }
  window.__exerciseSubmitterRunning = true;

  const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // 填入实际Token
  
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const formatTime = (date) => date.toLocaleTimeString('zh-CN', { hour12: false });
  
  const randomIntervalMs = (minSeconds, maxSeconds) => {
    const seconds = randomInt(minSeconds, maxSeconds);
    return seconds * 1000;
  };

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

  const getExerciseInterval = () => randomIntervalMs(500, 710);

  const results = [];

  console.log(`\n🏋️ [${formatTime(new Date())}] 开始执行：运动数据提交`);
  console.log(`   共${exercises.length}项运动`);
  console.log(`   间隔时间: 8分20秒 - 11分50秒 (随机)`);

  (async () => {
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      
      // ✅ 修正：统一格式 "性别男，体重65kg，身高175cm，运动名X秒，计数X个，"
      const remark = `性别男，体重65kg，身高175cm，${ex.name}${ex.actualDuration}秒，计数${ex.actualCount}个，`;

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
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            console.error(`🔴 Token 已过期，请更新后重试`);
            break;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        results.push({ name: ex.name, success: true, data });
        console.log(`   ✅ ${ex.name} 完成 (${ex.actualDuration}秒, ${ex.actualCount}个)`);
        
      } catch (err) {
        results.push({ name: ex.name, success: false, error: err.message });
        console.error(`   ❌ ${ex.name} 失败:`, err.message);
      }
      
      if (i < exercises.length - 1) {
        const intervalMs = getExerciseInterval();
        const min = Math.floor(intervalMs / 60000);
        const sec = Math.floor((intervalMs % 60000) / 1000);
        console.log(`   ⏳ 等待 ${min}分${sec}秒...`);
        await sleep(intervalMs);
      }
    }
    
    console.log(`\n🎉 运动任务完成！成功: ${results.filter(r => r.success).length}/${exercises.length}`);
    window.__exerciseSubmitterRunning = false;
    return results;
  })();
})();