const os = require('os');
const io = require('socket.io');
const { performance } = require('perf_hooks');

class MetricsService {
    constructor(server) {
        this.io = io(server);
        this.metrics = {
            cpu: 0,
            memory: 0,
            responseTime: 0,
            errorRate: 0,
            requests: 0,
            prevCpu: 0,
            prevMemory: 0,
            prevResponseTime: 0,
            prevErrorRate: 0,
            timestamp: new Date().toISOString()
        };
        this.requestCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
        this.setupMetricsCollection();
    }

    setupMetricsCollection() {
        // Collect metrics every second
        setInterval(() => {
            this.collectMetrics();
            this.emitMetrics();
        }, 1000);

        // Reset counters every minute
        setInterval(() => {
            this.requestCount = 0;
            this.errorCount = 0;
            this.startTime = Date.now();
        }, 60000);
    }

    collectMetrics() {
        // CPU usage
        const cpus = os.cpus();
        const totalCpuTime = cpus.reduce((acc, cpu) => {
            return acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
        }, 0);
        const idleCpuTime = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        const cpuUsage = ((totalCpuTime - idleCpuTime) / totalCpuTime) * 100;

        // Memory usage
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

        // Update metrics
        this.metrics.prevCpu = this.metrics.cpu;
        this.metrics.prevMemory = this.metrics.memory;
        this.metrics.prevResponseTime = this.metrics.responseTime;
        this.metrics.prevErrorRate = this.metrics.errorRate;

        this.metrics.cpu = Math.round(cpuUsage);
        this.metrics.memory = Math.round(memoryUsage);
        this.metrics.timestamp = new Date().toISOString();
    }

    emitMetrics() {
        this.io.emit('metrics', this.metrics);
    }

    recordRequest(duration) {
        this.requestCount++;
        this.metrics.requests = this.requestCount;
        this.metrics.responseTime = duration;
    }

    recordError() {
        this.errorCount++;
        const totalRequests = this.requestCount || 1;
        this.metrics.errorRate = (this.errorCount / totalRequests) * 100;
    }

    middleware() {
        return (req, res, next) => {
            const start = performance.now();
            
            res.on('finish', () => {
                const duration = performance.now() - start;
                this.recordRequest(duration);
                
                if (res.statusCode >= 400) {
                    this.recordError();
                }
            });

            next();
        };
    }
}

module.exports = MetricsService; 