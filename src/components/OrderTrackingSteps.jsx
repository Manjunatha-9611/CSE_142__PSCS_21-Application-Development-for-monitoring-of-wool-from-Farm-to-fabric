import React, { useMemo } from 'react';

const OrderTrackingSteps = ({ batch, trackingHistory = [] }) => {

  // Define standard workflow order
  const standardSteps = useMemo(() => [
    {
      key: 'FARM',
      title: 'Farm',
      description: 'Wool sheared and registered',
      icon: 'fas fa-seedling',
      statuses: ['CREATED', 'REGISTERED']
    },
    {
      key: 'QUALITY',
      title: 'Quality Check',
      description: 'Quality assessment and grading',
      icon: 'fas fa-clipboard-check',
      statuses: ['QUALITY_CHECK', 'QUALITY_VERIFIED', 'CERTIFIED', 'PENDING_QUALITY_CHECK']
    },
    {
      key: 'DISTRIBUTION',
      title: 'In Transit',
      description: 'Batch is being transported',
      icon: 'fas fa-truck',
      statuses: ['IN_TRANSIT', 'DISTRIBUTION', 'SHIPPED']
    },
    {
      key: 'PROCESSING',
      title: 'Processing',
      description: 'Wool processed and cleaned',
      icon: 'fas fa-cogs',
      statuses: ['PROCESSING', 'IN_PROCESSING']
    },
    {
      key: 'COMPLETED',
      title: 'Completed',
      description: 'Process completed',
      icon: 'fas fa-check-circle',
      statuses: ['DELIVERED', 'COMPLETED', 'SOLD']
    }
  ], []);

  // Generate dynamic steps based on tracking history
  const dynamicSteps = useMemo(() => {
    if (!trackingHistory || trackingHistory.length === 0) {
      return standardSteps;
    }

    // Extract unique process types from tracking history
    const processTypes = [...new Set(
      trackingHistory.map(entry => {
        const process = entry.process || entry.status || 'UNKNOWN';
        return process.toUpperCase();
      })
    )];

    // Create steps from tracking data
    const steps = processTypes.map((processType, index) => {
      // Find matching standard step or create custom one
      const matchingStandard = standardSteps.find(s =>
        s.key === processType || s.statuses.includes(processType)
      );

      if (matchingStandard) {
        return matchingStandard;
      }

      // Create custom step for non-standard processes
      return {
        key: processType,
        title: processType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
        description: `${processType.replace(/_/g, ' ')}`,
        icon: 'fas fa-circle',
        statuses: [processType]
      };
    });

    // Always ensure standard order for known steps, append custom steps
    const orderedSteps = standardSteps.filter(std =>
      steps.some(s => s.key === std.key || std.statuses.some(status =>
        steps.some(step => step.key === status || step.statuses.includes(status))
      ))
    );

    // Add any custom steps not in standard order
    const customSteps = steps.filter(s =>
      !orderedSteps.some(os => os.key === s.key)
    );

    return [...orderedSteps, ...customSteps];
  }, [trackingHistory, standardSteps]);

  const getStepStatus = (step) => {
    if (!batch) return 'pending';

    const currentStatus = batch.status?.toUpperCase();

    // Check if current batch status matches this step
    if (step.statuses.includes(currentStatus)) {
      return 'active';
    }

    // Check tracking history for this step
    const hasBeenCompleted = trackingHistory.some(entry => {
      const entryProcess = (entry.process || entry.status || '').toUpperCase();
      return step.statuses.includes(entryProcess) ||
        step.key === entryProcess ||
        entryProcess.includes(step.key);
    });

    if (hasBeenCompleted) {
      return 'completed';
    }

    // Check if step comes before currentstatus in sequence
    const currentStepIndex = dynamicSteps.findIndex(s =>
      s.statuses.includes(currentStatus)
    );
    const thisStepIndex = dynamicSteps.findIndex(s => s.key === step.key);

    if (currentStepIndex !== -1 && thisStepIndex < currentStepIndex) {
      return 'completed';
    }

    return 'pending';
  };

  return (
    <div className="klwb-progress-timeline">
      {dynamicSteps.map((step, index) => {
        const status = getStepStatus(step);
        const isCompleted = status === 'completed';
        const isActive = status === 'active';

        return (
          <div key={step.key} className={`klwb-timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
            <div className="klwb-timeline-circle">
              {isCompleted ? (
                <i className="fas fa-check"></i>
              ) : isActive ? (
                <i className={step.icon}></i>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="klwb-timeline-label">{step.title}</div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTrackingSteps;