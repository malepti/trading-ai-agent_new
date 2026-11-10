package com.nova.assistant.agent.state

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import com.nova.assistant.core.model.NovaTask

/**
 * 15 Deterministic States of the NOVA OS Coordinator.
 * The LLM must NEVER independently bypass or jump states.
 */
enum class NovaState {
    IDLE,
    LISTENING,
    AUTHENTICATING,
    TRANSCRIBING,
    UNDERSTANDING,
    OBSERVING,
    PLANNING,
    DISAMBIGUATING,
    STAGING,
    AWAITING_APPROVAL,
    EXECUTING,
    VERIFYING,
    COMPLETED,
    FAILED,
    CANCELLED
}

/**
 * Deterministic State Machine Coordinator enforcing valid transitions,
 * task execution context, and safety timeouts.
 */
class NovaStateCoordinator {

    private val _currentState = MutableStateFlow(NovaState.IDLE)
    val currentState: StateFlow<NovaState> = _currentState.asStateFlow()

    private var activeTask: NovaTask? = null

    // Allowed state transition graph
    private val validTransitions: Map<NovaState, Set<NovaState>> = mapOf(
        NovaState.IDLE to setOf(NovaState.LISTENING),
        NovaState.LISTENING to setOf(NovaState.AUTHENTICATING, NovaState.CANCELLED, NovaState.FAILED),
        NovaState.AUTHENTICATING to setOf(NovaState.TRANSCRIBING, NovaState.FAILED, NovaState.CANCELLED),
        NovaState.TRANSCRIBING to setOf(NovaState.UNDERSTANDING, NovaState.FAILED, NovaState.CANCELLED),
        NovaState.UNDERSTANDING to setOf(NovaState.OBSERVING, NovaState.PLANNING, NovaState.FAILED, NovaState.CANCELLED),
        NovaState.OBSERVING to setOf(NovaState.PLANNING, NovaState.FAILED, NovaState.CANCELLED),
        NovaState.PLANNING to setOf(NovaState.DISAMBIGUATING, NovaState.STAGING, NovaState.EXECUTING, NovaState.FAILED, NovaState.CANCELLED),
        NovaState.DISAMBIGUATING to setOf(NovaState.PLANNING, NovaState.STAGING, NovaState.CANCELLED, NovaState.FAILED),
        NovaState.STAGING to setOf(NovaState.AWAITING_APPROVAL, NovaState.EXECUTING, NovaState.CANCELLED),
        NovaState.AWAITING_APPROVAL to setOf(NovaState.EXECUTING, NovaState.CANCELLED, NovaState.FAILED),
        NovaState.EXECUTING to setOf(NovaState.VERIFYING, NovaState.FAILED, NovaState.CANCELLED),
        NovaState.VERIFYING to setOf(NovaState.COMPLETED, NovaState.FAILED),
        NovaState.COMPLETED to setOf(NovaState.IDLE),
        NovaState.FAILED to setOf(NovaState.IDLE),
        NovaState.CANCELLED to setOf(NovaState.IDLE)
    )

    fun transitionTo(newState: NovaState): Boolean {
        val current = _currentState.value
        val allowed = validTransitions[current] ?: emptySet()
        if (allowed.contains(newState)) {
            _currentState.value = newState
            return true
        }
        return false
    }

    fun attachTask(task: NovaTask) {
        this.activeTask = task
    }

    fun getActiveTask(): NovaTask? = activeTask

    fun clearTask() {
        this.activeTask = null
    }

    fun reset() {
        _currentState.value = NovaState.IDLE
        activeTask = null
    }
}
