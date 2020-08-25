import log from 'salvo-lite/log'
import YouTubePlayer from 'youtube-player'

class YoutubeVideo {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._videoTriggerElem = this._elem.querySelector('[data-video-trigger]')
        this._playElems = this._elem.querySelectorAll('[data-play-video]')
        this._pauseElems = this._elem.querySelectorAll('[data-pause-video]')
        this._rewindElems = this._elem.querySelectorAll('[data-rewind-video]')
        this._fastforwardElems = this._elem.querySelectorAll('[data-fastforward-video]')
        this._playerElem = this._elem.querySelector('[data-video-player]')
        this._videoID = this._elem.dataset.youtubeVideo
        this._player = null
        this._videoSettings = this._playerElem.dataset.videoSettings ? JSON.parse(this._playerElem.dataset.videoSettings) : {}

        this._videoSettings = Object.assign({
            enablejsapi: 1,
            showinfo: 0,
            controls: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            fs: 0,
            always_fs: 0,
            dontInit: false
        }, this._videoSettings)
        this._stateNames = {
            '-1': 'unstarted',
            0: 'ended',
            1: 'playing',
            2: 'paused',
            3: 'buffering',
            5: 'video-cued'
        }
        if (!this._videoSettings.dontInit) {
            this.init()
        }
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
    }

    init () {
        log.debug(this.constructor.name, 'Initiating')
        this.loadPlayer()

        this._player.on('ready', () => {
            if (this._videoSettings.muted) this._player.mute()
        })

        if (this._videoTriggerElem) {
            this._videoTriggerElem.addEventListener('click', (e) => {
                this._player.getPlayerState().then((state) => {
                    console.log(this._player)
                    if (this._stateNames[state] === 'playing' || this._stateNames[state] === 'buffering') {
                        this.pause()
                    } else {
                        this.play()
                    }
                })
                if (this._videoSettings.always_fs) this.goFullScreen()
            })
        }

        for (let playElem of this._playElems) {
            playElem.addEventListener('click', e => {
                e.preventDefault()
                this.play()
            })
        }

        for (let pauseElem of this._pauseElems) {
            pauseElem.addEventListener('click', e => {
                e.preventDefault()
                this.pause()
            })
        }

        for (let rewindElem of this._rewindElems) {
            rewindElem.addEventListener('click', async e => {
                e.preventDefault()
                let currentTime = await this._player.getCurrentTime()
                let newTime = currentTime - 10
                if (newTime <= 0) newTime = 0
                this._player.seekTo(newTime)
            })
        }

        for (let fastforwardElem of this._fastforwardElems) {
            fastforwardElem.addEventListener('click', async e => {
                e.preventDefault()
                let currentTime = await this._player.getCurrentTime()
                let duration = await this._player.getDuration()
                let newTime = currentTime + 10
                if (newTime >= duration) newTime = duration
                this._player.seekTo(newTime)
            })
        }

        this._player.on('stateChange', (e) => {
            for (var key in this._stateNames) {
                if (this._stateNames.hasOwnProperty(key)) this._elem.classList.remove(this._stateNames[key])
            }
            log.debug(this.constructor.name, 'StateChange', e)
            if (this._stateNames[e.data]) {
                this._elem.classList.add(this._stateNames[e.data])

                if (this._stateNames[e.data] === 'playing') {
                    this._elem.classList.add('been-played')
                }
            }
        })

        this._elem.addEventListener('playVideo', e => {
            this.play()
        })

        this._elem.addEventListener('pauseVideo', e => {
            this.pause()
        })

        log.debug(this.constructor.name, 'Initiated')
    }

    pause () {
        this._player.pauseVideo()
    }

    play () {
        this._player.playVideo()
    }

    loadPlayer () {
        this._player = YouTubePlayer(this._playerElem, {
            width: '1920',
            height: '1080',
            videoId: this._videoID,
            playerVars: this._videoSettings
        })
    }

    goFullScreen () {
        if (this._player) {
            this._player.getIframe().then((iframe) => {
                log.debug(this.constructor.name, 'Iframe', iframe)
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen()
                } else if (iframe.webkitRequestFullscreen) {
                    iframe.webkitRequestFullscreen()
                } else if (iframe.mozRequestFullScreen) {
                    iframe.mozRequestFullScreen()
                } else if (iframe.msRequestFullscreen) {
                    iframe.msRequestFullscreen()
                }
            })
        }
    }
}

export default YoutubeVideo
