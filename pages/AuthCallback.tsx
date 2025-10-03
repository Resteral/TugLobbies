/**
 * Authentication Callback Page
 * Handles OAuth callbacks from Discord and other providers
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { discordOAuth } from '../services/discord-oauth'
import { supabaseAuth } from '../services/supabase-auth'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const provider = searchParams.get('provider') || 'discord'

    if (error) {
      setStatus('error')
      setMessage(`Authentication failed: ${error}`)
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('No authentication code provided')
      return
    }

    try {
      if (provider === 'discord') {
        const result = await discordOAuth.handleCallback(code)
        
        if (result.success && result.user) {
          // Get current Supabase user
          const currentUser = await supabaseAuth.getCurrentUser()
          
          if (currentUser) {
            // Link Discord account to current user
            const linked = await discordOAuth.linkDiscordAccount(currentUser.id, result.user)
            
            if (linked) {
              setStatus('success')
              setMessage('Discord account linked successfully!')
              
              // Redirect to home after delay
              setTimeout(() => navigate('/'), 2000)
              return
            }
          }
        }
        
        setStatus('error')
        setMessage(result.error || 'Failed to link Discord account')
      }
    } catch (err) {
      console.error('Auth callback error:', err)
      setStatus('error')
      setMessage('An unexpected error occurred during authentication')
    }
  }

  const handleReturnHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">
            Authentication
          </CardTitle>
          <CardDescription className="text-gray-400">
            {status === 'loading' && 'Processing authentication...'}
            {status === 'success' && 'Authentication successful!'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
              <p className="text-gray-300">Please wait while we authenticate your account...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <p className="text-gray-300">{message}</p>
              <p className="text-gray-400 text-sm">Redirecting you to the home page...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-400 mx-auto" />
              <p className="text-gray-300">{message}</p>
              <Button 
                onClick={handleReturnHome}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Return to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}