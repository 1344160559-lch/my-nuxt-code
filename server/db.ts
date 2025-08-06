import mysql from 'mysql2/promise'

// 获取环境变量
const getEnvVar = (name: string, defaultValue: string = '') => {
  return process.env[name] || defaultValue
}

// 创建数据库连接池
const pool = mysql.createPool({
    host: getEnvVar('DB_HOST', '127.0.0.1'),
    user: getEnvVar('DB_USER', 'root'),
    password: getEnvVar('DB_PASS', ''),
    database: getEnvVar('DB_NAME', 'code_snippets'),
    port: Number(getEnvVar('DB_PORT', '3306')),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 增加连接超时设置
    connectTimeout: 60000, // 60秒
    // 启用保持活动状态
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // 10秒
    // 增加错误处理
    namedPlaceholders: true // 使用命名占位符提高SQL安全性
})

// 创建一个包装函数来处理数据库连接错误和重试
const executeWithRetry = async (query: string, params: any[], maxRetries = 3) => {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            return await pool.execute(query, params);
        } catch (error: any) {
            retries++;
            
            // 检查是否是连接错误
            if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
                console.warn(`数据库连接错误，正在重试 (${retries}/${maxRetries})...`);
                
                // 等待一段时间再重试
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                
                // 如果已经达到最大重试次数，则抛出错误
                if (retries >= maxRetries) {
                    console.error('达到最大重试次数，无法连接到数据库');
                    throw error;
                }
            } else {
                // 如果不是连接错误，直接抛出
                throw error;
            }
        }
    }
};

// 添加获取连接的方法
const getConnection = async () => {
    try {
        return await pool.getConnection();
    } catch (error: any) {
        console.error('获取数据库连接失败:', error);
        throw error;
    }
};

// 导出增强的连接池
export default {
    ...pool,
    executeWithRetry,
    getConnection
};
