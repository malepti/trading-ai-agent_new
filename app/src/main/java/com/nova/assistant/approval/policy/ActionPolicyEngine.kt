package com.nova.assistant.approval.policy

import com.nova.assistant.core.model.NovaTask
import com.nova.assistant.core.model.RiskLevel
import java.security.MessageDigest

/**
 * Human-In-The-Loop Approval and Action Policy Engine.
 * Enforces risk classification and cryptographic token binding.
 */
class ActionPolicyEngine {

    companion object {
        const val APPROVAL_TTL_MS = 30_000L // 30 seconds
    }

    /**
     * Determines the risk category based on task intent and target mutation.
     */
    fun classifyRisk(intent: String, isDestructive: Boolean): RiskLevel {
        return when (intent.uppercase()) {
            "SEND_MESSAGE", "SEND_EMAIL", "DELETE_FILE", "TRANSFER_MONEY", "SYSTEM_SETTING" -> 
                RiskLevel.HIGH_RISK_MUTATION
            "TYPE_DRAFT", "SAVE_NOTE", "SWITCH_TAB" -> 
                RiskLevel.LOW_RISK_MUTATION
            else -> 
                if (isDestructive) RiskLevel.HIGH_RISK_MUTATION else RiskLevel.READ_ONLY
        }
    }

    /**
     * Computes a cryptographic SHA-256 hash of the exact staged action.
     * Prevents approval diversion or payload mutation after staging.
     */
    fun computePayloadHash(task: NovaTask): String {
        val payloadString = "${task.taskId}|${task.targetApp}|${task.intent}|${task.stagedSummary}|${task.steps.size}"
        val bytes = MessageDigest.getInstance("SHA-256").digest(payloadString.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { "%02x".format(it) }
    }

    /**
     * Verifies that the approval token matches the active staged task fingerprint.
     */
    fun verifyApproval(task: NovaTask, approvalToken: String, timestamp: Long): Boolean {
        if (System.currentTimeMillis() - timestamp > APPROVAL_TTL_MS) {
            return false // Expired
        }
        val expectedHash = computePayloadHash(task)
        return expectedHash == approvalToken
    }
}
