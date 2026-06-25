// src/dashboard/pages/deployments/tracking.tsx

import React, { useEffect, useState } from 'react'
import { LineChart, ProgressBar, Badge, Timeline } from '@/components/ui'

interface DeploymentEvent {
  id: string
  phase: string
  status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'
  message: string
  timestamp: Date
  duration?: number
  error?: string
}

interface Deployment {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'
  progress: number
  total_steps: number
  current_phase: string
  started_at: Date
  completed_at?: Date
  vps_host: string
  branch: string
  events: DeploymentEvent[]
}

export default function DeploymentTracking() {
  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [deploymentId, setDeploymentId] = useState('')

  // Start new deployment
  const handleStartDeployment = async () => {
    try {
      const response = await fetch('/api/v1/deployments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vps_host: 'agennext.com',
          branch: 'main'
        })
      })

      const data = await response.json()
      setDeploymentId(data.deployment_id)
      setIsLive(true)
      streamDeploymentEvents(data.deployment_id)
    } catch (error) {
      console.error('Failed to start deployment:', error)
    }
  }

  // Stream deployment events
  const streamDeploymentEvents = (id: string) => {
    const eventSource = new EventSource(`/api/v1/deployments/${id}/stream`)

    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'complete') {
        setIsLive(false)
        eventSource.close()
      } else {
        // Update deployment with new event
        fetchDeployment(id)
      }
    })

    eventSource.onerror = () => {
      console.error('SSE error')
      eventSource.close()
    }
  }

  // Fetch deployment details
  const fetchDeployment = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/deployments/${id}`)
      const data = await response.json()
      setDeployment(data)
    } catch (error) {
      console.error('Failed to fetch deployment:', error)
    }
  }

  // Poll for updates if not streaming
  useEffect(() => {
    if (!isLive || !deploymentId) return

    const interval = setInterval(() => {
      fetchDeployment(deploymentId)
    }, 1000)

    return () => clearInterval(interval)
  }, [isLive, deploymentId])

  if (!deployment) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Deployment Tracking</h1>
          <p className="text-gray-600">
            Monitor VPS deployment progress in real-time with Cortex workflows
          </p>
        </div>

        <button
          onClick={handleStartDeployment}
          className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
        >
          🚀 Start Deployment
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ol className="space-y-2 text-sm">
            <li>1. Click "Start Deployment" to begin</li>
            <li>2. Real-time tracking via Cortex workflows</li>
            <li>3. Monitor each phase as it completes</li>
            <li>4. Get alerts on failures</li>
            <li>5. View complete deployment history</li>
          </ol>
        </div>
      </div>
    )
  }

  const progressPercent = Math.round((deployment.progress / deployment.total_steps) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Deployment #{deployment.id.slice(0, 8)}</h1>
          <p className="text-gray-600">
            {deployment.vps_host} • Branch: {deployment.branch}
          </p>
        </div>
        <Badge
          color={
            deployment.status === 'SUCCESS'
              ? 'green'
              : deployment.status === 'FAILED'
              ? 'red'
              : 'blue'
          }
        >
          {deployment.status}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>
            {deployment.progress}/{deployment.total_steps} ({progressPercent}%)
          </span>
        </div>
        <ProgressBar value={progressPercent} />
      </div>

      {/* Current Phase */}
      {isLive && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin">⚙️</div>
            <span className="font-semibold">Current Phase: {deployment.current_phase}</span>
          </div>
        </div>
      )}

      {/* Timeline of Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Deployment Timeline</h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {deployment.events.map((event, idx) => (
            <div
              key={event.id}
              className="border rounded p-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  {event.status === 'SUCCESS' && (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      ✓
                    </div>
                  )}
                  {event.status === 'IN_PROGRESS' && (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 animate-pulse">
                      ⟳
                    </div>
                  )}
                  {event.status === 'FAILED' && (
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      ✕
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {event.phase}
                    </code>
                    {event.duration && (
                      <span className="text-xs text-gray-500">
                        {(event.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>

                  <p className="text-sm mt-1">{event.message}</p>

                  {event.error && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                      Error: {event.error}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">Started At</div>
          <div className="font-semibold">
            {new Date(deployment.started_at).toLocaleTimeString()}
          </div>
        </div>

        {deployment.completed_at && (
          <>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Completed At</div>
              <div className="font-semibold">
                {new Date(deployment.completed_at).toLocaleTimeString()}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold">
                {(
                  (new Date(deployment.completed_at).getTime() -
                    new Date(deployment.started_at).getTime()) /
                  1000
                ).toFixed(1)}
                s
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {!isLive && (
        <div className="flex gap-2">
          <button
            onClick={() => fetchDeployment(deploymentId)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>

          <button
            onClick={() => {
              setDeployment(null)
              setDeploymentId('')
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            New Deployment
          </button>
        </div>
      )}
    </div>
  )
}
