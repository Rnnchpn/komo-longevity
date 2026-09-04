export const ACTION_POLICY = {
  'timeline.compare': { capability:'twin.compare_snapshots', risk:'read' },
  'world.focus_source': { capability:'world.focus_source', risk:'read' },
  'world.focus_region': { capability:'world.focus_region', risk:'read' },
  'world.camera': { capability:'world.camera', risk:'read' },
  'world.open_room': { capability:'world.open_room', risk:'read' },
  'rehab.preview_session': { capability:'rehab.preview_session', risk:'read' },
  'provenance.read': { capability:'provenance.read', risk:'read' },
  'measurement.modify': { capability:'measurement.modify', risk:'forbidden' },
  'motion_score.override': { capability:'motion_score.override', risk:'forbidden' },
  'clinical_prescription.autonomous_write': { capability:'clinical_prescription.autonomous_write', risk:'forbidden' },
};

export function validateAgentAction(context, action) {
  const rule = ACTION_POLICY[action?.type];
  if (!rule) return { ok:false, reason:'unknown_action' };
  if (rule.risk === 'forbidden') return { ok:false, reason:'forbidden_action' };
  if (!context.allowed_capabilities.includes(rule.capability)) return { ok:false, reason:'missing_capability' };
  return { ok:true, reason:'allowed' };
}

function normalize(text) { return String(text || '').trim().toLowerCase(); }

export function localIntentPlanner(prompt, context) {
  const q = normalize(prompt);
  const current = context.snapshot;
  const baseline = context.comparison_snapshot;

  if (!q) return { intent:'empty', spoken_summary:'Ask about change, your main limitation, a data source, or Rehab.', actions:[] };

  if (q.includes('baseline') || q.includes('compare') || q.includes('changé') || q.includes('change')) {
    return {
      intent:'compare_longitudinal',
      spoken_summary:`From ${baseline?.label || 'baseline'} to ${current.label}, Motion Score changed from ${baseline?.motion_score ?? '—'} to ${current.motion_score}. The interface will now show the longitudinal comparison.`,
      actions:[
        { type:'timeline.compare', from:baseline?.id, to:current.id },
        { type:'world.camera', preset:'twin_full' },
      ]
    };
  }

  if (q.includes('limit') || q.includes('faible') || q.includes('weak') || q.includes('priorité') || q.includes('priority') || q.includes('problème')) {
    return {
      intent:'show_priority',
      spoken_summary:'The main remaining modifiable limitation in this demo snapshot is residual left quadriceps asymmetry. I will focus the strength layer and left thigh without changing the underlying data.',
      actions:[
        { type:'world.focus_source', source:'strength' },
        { type:'world.focus_region', region:'left_thigh' },
        { type:'world.camera', preset:'twin_lower_limb' },
      ]
    };
  }

  if (q.includes('score') || q.includes('pourquoi') || q.includes('why')) {
    return {
      intent:'explain_motion_score',
      spoken_summary:'Motion Score is treated as a deterministic derived layer. The agent may explain its contributing domains and provenance, but it cannot override the score.',
      actions:[
        { type:'world.focus_source', source:'motion_score' },
        { type:'provenance.read', source:'motion_score' },
      ]
    };
  }

  if (q.includes('rehab') || q.includes('exercice') || q.includes('exercise') || q.includes('train')) {
    return {
      intent:'preview_rehab',
      spoken_summary:'I can preview the currently authorised Rehab room and show how the Twin would pass context into it. This prototype does not autonomously prescribe or alter a clinical programme.',
      actions:[
        { type:'world.open_room', room:'rehab', mode:'preview' },
        { type:'rehab.preview_session', programme:'lower_limb_demo' },
      ]
    };
  }

  const source = ['myodev','gait','strength','posture','wearables','sleep','activity','rehab'].find(s => q.includes(s));
  if (source) {
    return {
      intent:'inspect_source',
      spoken_summary:`I will open the ${source} layer and its provenance for the current dated snapshot.`,
      actions:[
        { type:'world.focus_source', source },
        { type:'provenance.read', source },
      ]
    };
  }

  return {
    intent:'orient_user',
    spoken_summary:'I can compare your Twin across time, show the main functional priority, inspect Myodev/gait/strength/posture/wearables/sleep/activity/Rehab, explain Motion Score provenance, or preview the Rehab room.',
    actions:[]
  };
}

export async function executeAgentPlan({ plan, context, handlers, emit }) {
  const results = [];
  for (const action of plan.actions || []) {
    const validation = validateAgentAction(context, action);
    emit?.('agent.action.proposed', { action, validation }, 'agent-simulator');
    if (!validation.ok) {
      results.push({ action, ok:false, reason:validation.reason });
      emit?.('agent.action.blocked', { action, reason:validation.reason }, 'policy');
      continue;
    }
    const handler = handlers[action.type];
    if (!handler) {
      results.push({ action, ok:false, reason:'no_handler' });
      continue;
    }
    try {
      const value = await handler(action);
      results.push({ action, ok:true, value });
      emit?.('agent.action.executed', { action }, 'agent-simulator');
    } catch (error) {
      results.push({ action, ok:false, reason:error?.message || 'handler_error' });
      emit?.('agent.action.failed', { action, reason:error?.message || 'handler_error' }, 'system');
    }
  }
  return results;
}
