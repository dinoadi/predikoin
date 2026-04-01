/**
 * Monitoring & Analytics Helper
 * Track system performance & generate reports
 */

class MonitoringHelper {
  constructor(appwriteClient) {
    this.client = appwriteClient;
    this.metrics = [];
  }

  /**
   * Log function execution
   */
  logExecution(functionName, status, duration, data = {}) {
    const log = {
      function: functionName,
      status,
      duration,
      timestamp: new Date().toISOString(),
      data
    };

    console.log(`[${log.timestamp}] ${functionName}: ${status} (${duration}ms)`, data);
    this.metrics.push(log);

    return log;
  }

  /**
   * Calculate success rate
   */
  getSuccessRate() {
    if (this.metrics.length === 0) return 0;

    const successful = this.metrics.filter(m => m.status === 'success').length;
    return (successful / this.metrics.length * 100).toFixed(2);
  }

  /**
   * Calculate average execution time
   */
  getAverageExecutionTime(functionName = null) {
    let filtered = this.metrics;

    if (functionName) {
      filtered = this.metrics.filter(m => m.function === functionName);
    }

    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return (total / filtered.length).toFixed(2);
  }

  /**
   * Get function statistics
   */
  getFunctionStats(functionName) {
    const logs = this.metrics.filter(m => m.function === functionName);

    if (logs.length === 0) {
      return { error: 'No data for function: ' + functionName };
    }

    const successful = logs.filter(l => l.status === 'success').length;
    const failed = logs.filter(l => l.status === 'error').length;
    const avgTime = logs.reduce((sum, l) => sum + l.duration, 0) / logs.length;

    return {
      functionName,
      totalRuns: logs.length,
      successful,
      failed,
      successRate: ((successful / logs.length) * 100).toFixed(2),
      averageTime: avgTime.toFixed(2),
      minTime: Math.min(...logs.map(l => l.duration)),
      maxTime: Math.max(...logs.map(l => l.duration))
    };
  }

  /**
   * Generate report
   */
  generateReport() {
    if (this.metrics.length === 0) {
      return 'No metrics to report';
    }

    const functions = [...new Set(this.metrics.map(m => m.function))];
    const report = {
      totalRuns: this.metrics.length,
      successRate: this.getSuccessRate(),
      averageTime: this.getAverageExecutionTime(),
      functions: functions.map(f => this.getFunctionStats(f)),
      generatedAt: new Date().toISOString()
    };

    return report;
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics() {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Check alert conditions
   */
  checkAlerts() {
    const alerts = [];
    const successRate = parseFloat(this.getSuccessRate());

    if (successRate < 95) {
      alerts.push({
        severity: 'WARNING',
        message: `Success rate dropped to ${successRate}%`
      });
    }

    if (this.metrics.length > 0) {
      const avgTime = parseFloat(this.getAverageExecutionTime());
      if (avgTime > 5000) {
        alerts.push({
          severity: 'WARNING',
          message: `Average execution time is ${avgTime}ms (high)`
        });
      }
    }

    return alerts;
  }
}

module.exports = MonitoringHelper;
