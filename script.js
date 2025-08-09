alert('this a website used for connect across campus')

class ShadowTalkAuth {
  constructor() {
    this.currentUser = null
    this.users = new Map()
    this.posts = []
    this.rooms = new Map()
    this.chatWindows = new Map()
    this.windowZIndex = 1000
    this.syncInterval = null
    this.selectedProfilePic = null
    this.dragState = {
      isDragging: false,
      startX: 0,
      startY: 0,
      startLeft: 0,
      startTop: 0,
      element: null,
    }

    this.init()
  }

  init() {
    this.loadData()
    this.setupEventListeners()
    this.checkAuthState()
    this.startSyncSystem()
  }

  checkAuthState() {
    const savedUser = localStorage.getItem("shadowtalk_current_user")
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
      this.showMainApp()
    } else {
      this.showAuthScreen()
    }
  }

  showAuthScreen() {
    const authScreen = document.getElementById("auth-screen")
    const mainScreen = document.getElementById("main-screen")
    const profileSetupScreen = document.getElementById("profile-setup-screen")

    if (authScreen) authScreen.classList.add("active")
    if (mainScreen) mainScreen.classList.remove("active")
    if (profileSetupScreen) profileSetupScreen.classList.remove("active")
  }

  showProfileSetup() {
    const authScreen = document.getElementById("auth-screen")
    const profileSetupScreen = document.getElementById("profile-setup-screen")
    const mainScreen = document.getElementById("main-screen")

    if (authScreen) authScreen.classList.remove("active")
    if (profileSetupScreen) profileSetupScreen.classList.add("active")
    if (mainScreen) mainScreen.classList.remove("active")
  }

  showMainApp() {
    const authScreen = document.getElementById("auth-screen")
    const profileSetupScreen = document.getElementById("profile-setup-screen")
    const mainScreen = document.getElementById("main-screen")

    if (authScreen) authScreen.classList.remove("active")
    if (profileSetupScreen) profileSetupScreen.classList.remove("active")
    if (mainScreen) mainScreen.classList.add("active")

    this.updateUserInterface()
    this.generateSampleData()
    this.updateUI()
  }

  loadData() {
    try {
      // Load posts
      const savedPosts = localStorage.getItem("shadowtalk_posts")
      if (savedPosts) {
        this.posts = JSON.parse(savedPosts)
      }

      // Load rooms
      const savedRooms = localStorage.getItem("shadowtalk_rooms")
      if (savedRooms) {
        const roomsArray = JSON.parse(savedRooms)
        this.rooms = new Map(roomsArray)
      }

      // Load users
      const savedUsers = localStorage.getItem("shadowtalk_users")
      if (savedUsers) {
        const usersArray = JSON.parse(savedUsers)
        this.users = new Map(usersArray)
      }

      // Load theme
      const theme = localStorage.getItem("shadowtalk_theme") || "light"
      document.documentElement.setAttribute("data-theme", theme)
      this.updateThemeButton(theme)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  saveData() {
    try {
      localStorage.setItem("shadowtalk_posts", JSON.stringify(this.posts))
      localStorage.setItem("shadowtalk_rooms", JSON.stringify([...this.rooms]))
      localStorage.setItem("shadowtalk_users", JSON.stringify([...this.users]))
      if (this.currentUser) {
        localStorage.setItem("shadowtalk_current_user", JSON.stringify(this.currentUser))
      }
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  setupEventListeners() {
    // Auth form listeners
    this.setupAuthListeners()

    // Profile setup listeners
    this.setupProfileSetupListeners()

    // Main app listeners
    this.setupMainAppListeners()

    // Modal listeners
    this.setupModalListeners()

    // Global listeners
    this.setupGlobalListeners()
  }

  setupAuthListeners() {
    // Switch between login and register
    const showRegisterBtn = document.getElementById("show-register")
    const showLoginBtn = document.getElementById("show-login")
    const loginForm = document.getElementById("login-form")
    const registerForm = document.getElementById("register-form")

    if (showRegisterBtn) {
      showRegisterBtn.addEventListener("click", () => {
        loginForm?.classList.remove("active")
        registerForm?.classList.add("active")
      })
    }

    if (showLoginBtn) {
      showLoginBtn.addEventListener("click", () => {
        registerForm?.classList.remove("active")
        loginForm?.classList.add("active")
      })
    }

    // Login form submission
    const loginFormElement = document.getElementById("login-form-element")
    if (loginFormElement) {
      loginFormElement.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleLogin()
      })
    }

    // Register form submission
    const registerFormElement = document.getElementById("register-form-element")
    if (registerFormElement) {
      registerFormElement.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleRegister()
      })
    }
  }

  setupProfileSetupListeners() {
    // Profile picture selection
    const picOptions = document.querySelectorAll(".pic-option")
    picOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Remove previous selection
        picOptions.forEach((opt) => opt.classList.remove("selected"))
        option.classList.add("selected")

        const type = option.dataset.type
        if (type === "upload") {
          document.getElementById("profile-pic-upload")?.click()
        } else if (type === "avatar") {
          this.selectedProfilePic = {
            type: "avatar",
            data: option.dataset.avatar,
          }
          this.updateProfilePicPreview(option.dataset.avatar)
        }
      })
    })

    // File upload
    const profilePicUpload = document.getElementById("profile-pic-upload")
    if (profilePicUpload) {
      profilePicUpload.addEventListener("change", (e) => {
        this.handleProfilePicUpload(e)
      })
    }

    // Setup buttons
    const skipSetupBtn = document.getElementById("skip-setup-btn")
    const completeSetupBtn = document.getElementById("complete-setup-btn")

    if (skipSetupBtn) {
      skipSetupBtn.addEventListener("click", () => {
        this.completeProfileSetup()
      })
    }

    if (completeSetupBtn) {
      completeSetupBtn.addEventListener("click", () => {
        this.completeProfileSetup()
      })
    }
  }

  setupMainAppListeners() {
    // Navigation buttons
    const themeBtn = document.getElementById("theme-btn")
    const profileBtn = document.getElementById("profile-btn")
    const settingsBtn = document.getElementById("settings-btn")
    const logoutBtn = document.getElementById("logout-btn")

    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme())
    }

    if (profileBtn) {
      profileBtn.addEventListener("click", () => this.showProfileModal())
    }

    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => this.showSettingsModal())
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout())
    }

    // Post composer
    const postInput = document.getElementById("post-input")
    const postBtn = document.getElementById("post-btn")
    const charCounter = document.getElementById("char-counter")
    const addImageBtn = document.getElementById("add-image-btn")
    const postImageUpload = document.getElementById("post-image-upload")

    if (postInput && postBtn && charCounter) {
      postInput.addEventListener("input", () => {
        const length = postInput.value.length
        const remaining = 300 - length

        charCounter.textContent = remaining
        charCounter.className = "char-count"

        if (remaining < 50) charCounter.classList.add("warning")
        if (remaining < 0) charCounter.classList.add("danger")

        postBtn.disabled = length === 0 || remaining < 0
      })

      postBtn.addEventListener("click", () => this.createPost())

      postInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.ctrlKey) {
          this.createPost()
        }
      })
    }

    if (addImageBtn && postImageUpload) {
      addImageBtn.addEventListener("click", () => {
        postImageUpload.click()
      })

      postImageUpload.addEventListener("change", (e) => {
        this.handlePostImageUpload(e)
      })
    }

    // Feed controls
    const refreshFeedBtn = document.getElementById("refresh-feed-btn")
    if (refreshFeedBtn) {
      refreshFeedBtn.addEventListener("click", () => this.refreshFeed())
    }

    // Room creation
    const createRoomBtn = document.getElementById("create-room-btn")
    if (createRoomBtn) {
      createRoomBtn.addEventListener("click", () => this.showCreateRoomModal())
    }

    // Window controls
    const minimizeAllBtn = document.getElementById("minimize-all-btn")
    const tileWindowsBtn = document.getElementById("tile-windows-btn")
    const closeAllBtn = document.getElementById("close-all-btn")

    if (minimizeAllBtn) {
      minimizeAllBtn.addEventListener("click", () => this.minimizeAllWindows())
    }

    if (tileWindowsBtn) {
      tileWindowsBtn.addEventListener("click", () => this.tileWindows())
    }

    if (closeAllBtn) {
      closeAllBtn.addEventListener("click", () => this.closeAllWindows())
    }
  }

  setupModalListeners() {
    // Close modal buttons
    document.querySelectorAll(".close-modal-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal")
        if (modal) modal.classList.remove("active")
      })
    })

    // Profile modal
    const changePicBtn = document.getElementById("change-pic-btn")
    const saveProfileBtn = document.getElementById("save-profile-btn")

    if (changePicBtn) {
      changePicBtn.addEventListener("click", () => this.showPictureModal())
    }

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener("click", () => this.saveProfileChanges())
    }

    // Room modal
    const cancelRoomBtn = document.getElementById("cancel-room-btn")
    const confirmRoomBtn = document.getElementById("confirm-room-btn")

    if (cancelRoomBtn) {
      cancelRoomBtn.addEventListener("click", () => {
        document.getElementById("room-modal")?.classList.remove("active")
      })
    }

    if (confirmRoomBtn) {
      confirmRoomBtn.addEventListener("click", () => this.createRoom())
    }

    // Settings modal
    const copyLinkBtn = document.getElementById("copy-link-btn")
    const exportDataBtn = document.getElementById("export-data-btn")
    const clearDataBtn = document.getElementById("clear-data-btn")

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener("click", () => {
        this.copyToClipboard(window.location.href)
      })
    }

    if (exportDataBtn) {
      exportDataBtn.addEventListener("click", () => this.exportUserData())
    }

    if (clearDataBtn) {
      clearDataBtn.addEventListener("click", () => this.clearAllData())
    }

    // Settings tabs
    document.querySelectorAll(".settings-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab
        this.switchSettingsTab(tabName)
      })
    })

    // Picture modal
    const cancelPictureBtn = document.getElementById("cancel-picture-btn")
    const savePictureBtn = document.getElementById("save-picture-btn")

    if (cancelPictureBtn) {
      cancelPictureBtn.addEventListener("click", () => {
        document.getElementById("picture-modal")?.classList.remove("active")
      })
    }

    if (savePictureBtn) {
      savePictureBtn.addEventListener("click", () => this.savePictureSelection())
    }

    // Picture tabs
    document.querySelectorAll(".picture-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab
        this.switchPictureTab(tabName)
      })
    })

    // Avatar selection
    document.querySelectorAll(".avatar-option").forEach((option) => {
      option.addEventListener("click", () => {
        document.querySelectorAll(".avatar-option").forEach((opt) => opt.classList.remove("selected"))
        option.classList.add("selected")
        this.selectedProfilePic = {
          type: "avatar",
          data: option.dataset.avatar,
        }
      })
    })

    // Picture upload
    const uploadZone = document.getElementById("upload-zone")
    const pictureUpload = document.getElementById("picture-upload")

    if (uploadZone && pictureUpload) {
      uploadZone.addEventListener("click", () => pictureUpload.click())

      uploadZone.addEventListener("dragover", (e) => {
        e.preventDefault()
        uploadZone.classList.add("dragover")
      })

      uploadZone.addEventListener("dragleave", () => {
        uploadZone.classList.remove("dragover")
      })

      uploadZone.addEventListener("drop", (e) => {
        e.preventDefault()
        uploadZone.classList.remove("dragover")
        const files = e.dataTransfer.files
        if (files.length > 0) {
          this.handlePictureUpload(files[0])
        }
      })

      pictureUpload.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          this.handlePictureUpload(e.target.files[0])
        }
      })
    }

    // Close modals on backdrop click
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active")
        }
      })
    })
  }

  setupGlobalListeners() {
    // Drag functionality
    document.addEventListener("mousedown", (e) => this.handleMouseDown(e))
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e))
    document.addEventListener("mouseup", (e) => this.handleMouseUp(e))

    // Prevent text selection during drag
    document.addEventListener("selectstart", (e) => {
      if (this.dragState.isDragging) {
        e.preventDefault()
      }
    })
  }

  handleLogin() {
    const username = document.getElementById("login-username")?.value.trim()
    const password = document.getElementById("login-password")?.value

    if (!username || !password) {
      this.showError("Please fill in all fields")
      return
    }

    // Check if user exists
    const savedUsers = JSON.parse(localStorage.getItem("shadowtalk_registered_users") || "{}")
    const userKey = username.toLowerCase()

    if (!savedUsers[userKey]) {
      this.showError("User not found")
      return
    }

    if (savedUsers[userKey].password !== password) {
      this.showError("Invalid password")
      return
    }

    // Login successful
    this.currentUser = savedUsers[userKey]
    this.currentUser.lastLogin = new Date().toISOString()

    // Update user in storage
    savedUsers[userKey] = this.currentUser
    localStorage.setItem("shadowtalk_registered_users", JSON.stringify(savedUsers))

    this.saveData()
    this.showMainApp()
    this.showWelcomeBackMessage()
  }

  handleRegister() {
    const username = document.getElementById("register-username")?.value.trim()
    const password = document.getElementById("register-password")?.value
    const confirmPassword = document.getElementById("register-confirm")?.value
    const displayName = document.getElementById("register-display-name")?.value.trim()

    if (!username || !password || !confirmPassword) {
      this.showError("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      this.showError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      this.showError("Password must be at least 6 characters")
      return
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      this.showError("Username can only contain letters and numbers")
      return
    }

    // Check if username already exists
    const savedUsers = JSON.parse(localStorage.getItem("shadowtalk_registered_users") || "{}")
    const userKey = username.toLowerCase()

    if (savedUsers[userKey]) {
      this.showError("Username already exists")
      return
    }

    // Create new user
    this.currentUser = {
      id: `user_${Date.now()}`,
      username: username,
      displayName: displayName || username,
      password: password,
      profilePic: null,
      status: "",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      stats: {
        posts: 0,
        chats: 0,
        onlineTime: 0,
      },
    }

    // Save user
    savedUsers[userKey] = this.currentUser
    localStorage.setItem("shadowtalk_registered_users", JSON.stringify(savedUsers))

    this.saveData()
    this.showProfileSetup()
  }

  handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
      this.currentUser = null
      localStorage.removeItem("shadowtalk_current_user")
      this.closeAllWindows()
      this.showAuthScreen()
    }
  }

  showError(message) {
    // Simple error display - you can enhance this
    alert(message)
  }

  updateProfilePicPreview(avatar) {
    const setupImg = document.getElementById("setup-profile-img")
    const setupPlaceholder = document.getElementById("setup-profile-placeholder")

    if (setupImg && setupPlaceholder) {
      setupImg.style.display = "none"
      setupPlaceholder.style.display = "flex"
      setupPlaceholder.querySelector(".placeholder-icon").textContent = avatar
      setupPlaceholder.querySelector(".placeholder-text").textContent = "Avatar Selected"
    }
  }

  handleProfilePicUpload(e) {
    const file = e.target.files[0]
    if (file) {
      this.handlePictureUpload(file)
    }
  }

  handlePictureUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
      this.showError("File size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      this.selectedProfilePic = {
        type: "upload",
        data: e.target.result,
      }

      // Show preview
      const previewContainer = document.getElementById("image-preview")
      const previewImg = document.getElementById("preview-img")

      if (previewContainer && previewImg) {
        previewImg.src = e.target.result
        previewContainer.style.display = "block"
      }

      // Update setup preview if on setup screen
      const setupImg = document.getElementById("setup-profile-img")
      const setupPlaceholder = document.getElementById("setup-profile-placeholder")

      if (setupImg && setupPlaceholder) {
        setupImg.src = e.target.result
        setupImg.style.display = "block"
        setupPlaceholder.style.display = "none"
      }
    }
    reader.readAsDataURL(file)
  }

  completeProfileSetup() {
    if (this.selectedProfilePic) {
      this.currentUser.profilePic = this.selectedProfilePic
    }

    // Update user in storage
    const savedUsers = JSON.parse(localStorage.getItem("shadowtalk_registered_users") || "{}")
    const userKey = this.currentUser.username.toLowerCase()
    savedUsers[userKey] = this.currentUser
    localStorage.setItem("shadowtalk_registered_users", JSON.stringify(savedUsers))

    this.saveData()
    this.showMainApp()
    this.showWelcomeMessage()
  }

  updateUserInterface() {
    if (!this.currentUser) return

    // Update navigation
    const navUsername = document.getElementById("nav-username")
    const navDisplayName = document.getElementById("nav-display-name")

    if (navUsername) navUsername.textContent = this.currentUser.username
    if (navDisplayName) navDisplayName.textContent = this.currentUser.displayName || ""

    // Update profile pictures
    this.updateAllProfilePictures()

    // Update composer
    const composerUsername = document.getElementById("composer-username")
    if (composerUsername) composerUsername.textContent = this.currentUser.displayName || this.currentUser.username

    // Update share link
    const shareLinkInput = document.getElementById("share-link-input")
    if (shareLinkInput) shareLinkInput.value = window.location.href
  }

  updateAllProfilePictures() {
    if (!this.currentUser?.profilePic) return

    const profileElements = [
      { img: "nav-profile-img", placeholder: "nav-profile-placeholder" },
      { img: "composer-profile-img", placeholder: "composer-profile-placeholder" },
      { img: "modal-profile-img", placeholder: "modal-profile-placeholder" },
    ]

    profileElements.forEach(({ img, placeholder }) => {
      const imgElement = document.getElementById(img)
      const placeholderElement = document.getElementById(placeholder)

      if (imgElement && placeholderElement) {
        if (this.currentUser.profilePic.type === "upload") {
          imgElement.src = this.currentUser.profilePic.data
          imgElement.style.display = "block"
          placeholderElement.style.display = "none"
        } else {
          imgElement.style.display = "none"
          placeholderElement.style.display = "flex"
          placeholderElement.textContent = this.currentUser.profilePic.data
        }
      }
    })
  }

  generateSampleData() {
    // Add some sample rooms if none exist
    if (this.rooms.size === 0) {
      const sampleRooms = [
        { name: "General Chat", description: "General discussion", members: 3 },
        { name: "Tech Talk", description: "Technology discussions", members: 5 },
        { name: "Random", description: "Random conversations", members: 2 },
      ]

      sampleRooms.forEach((room, index) => {
        const roomId = `room_${Date.now()}_${index}`
        this.rooms.set(roomId, {
          id: roomId,
          name: room.name,
          description: room.description,
          members: room.members,
          createdAt: new Date().toISOString(),
          messages: [],
        })
      })
    }

    // Add some sample users if none exist
    if (this.users.size === 0) {
      const sampleUsers = [
        { username: "🐱TechCat42", displayName: "Tech Cat", online: true },
        { username: "🦊CodeFox88", displayName: "Code Fox", online: true },
        { username: "🐺NightWolf23", displayName: "Night Wolf", online: false },
      ]

      sampleUsers.forEach((user, index) => {
        const userId = `user_sample_${Date.now()}_${index}`
        this.users.set(userId, {
          id: userId,
          username: user.username,
          displayName: user.displayName,
          online: user.online,
          lastSeen: new Date().toISOString(),
          profilePic: {
            type: "avatar",
            data: user.username.charAt(0),
          },
        })
      })
    }

    this.saveData()
  }

  startSyncSystem() {
    // Simulate real-time sync
    this.syncInterval = setInterval(() => {
      this.performSync()
    }, 5000)

    // Update sync indicator
    this.updateSyncIndicator("synced")
  }

  performSync() {
    // Simulate sync process
    this.updateSyncIndicator("syncing")

    setTimeout(() => {
      // Simulate random user activity
      this.simulateUserActivity()
      this.updateSyncIndicator("synced")
      this.updateUI()
    }, 1000)
  }

  simulateUserActivity() {
    // Randomly update user online status
    this.users.forEach((user, userId) => {
      if (Math.random() < 0.1) {
        // 10% chance to change status
        user.online = !user.online
        user.lastSeen = new Date().toISOString()
      }
    })

    // Update online count
    this.updateOnlineCount()
  }

  updateSyncIndicator(status) {
    const syncDot = document.querySelector(".sync-dot")
    const syncText = document.getElementById("sync-text")

    if (syncDot && syncText) {
      syncDot.className = "sync-dot"

      switch (status) {
        case "syncing":
          syncDot.classList.add("syncing")
          syncText.textContent = "Syncing..."
          break
        case "synced":
          syncText.textContent = "Synced"
          break
        case "error":
          syncDot.classList.add("error")
          syncText.textContent = "Sync Error"
          break
      }
    }
  }

  updateOnlineCount() {
    const onlineUsers = Array.from(this.users.values()).filter((user) => user.online)
    const onlineCount = document.getElementById("online-count")
    const onlineUsersCount = document.getElementById("online-users-count")

    if (onlineCount) onlineCount.textContent = onlineUsers.length
    if (onlineUsersCount) onlineUsersCount.textContent = `👥 ${onlineUsers.length + 1} online`
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("shadowtalk_theme", newTheme)
    this.updateThemeButton(newTheme)
  }

  updateThemeButton(theme) {
    const themeBtn = document.getElementById("theme-btn")
    if (themeBtn) {
      themeBtn.textContent = theme === "dark" ? "☀️" : "🌙"
    }
  }

  showProfileModal() {
    const modal = document.getElementById("profile-modal")
    if (modal && this.currentUser) {
      // Update profile info
      const profileUsername = document.getElementById("profile-username")
      const profileDisplayName = document.getElementById("profile-display-name")
      const profileStatus = document.getElementById("profile-status")

      if (profileUsername) profileUsername.textContent = this.currentUser.username
      if (profileDisplayName) profileDisplayName.value = this.currentUser.displayName || ""
      if (profileStatus) profileStatus.value = this.currentUser.status || ""

      // Update stats
      const postsCount = document.getElementById("posts-count")
      const chatsCount = document.getElementById("chats-count")
      const onlineTime = document.getElementById("online-time")

      if (postsCount) postsCount.textContent = this.currentUser.stats?.posts || 0
      if (chatsCount) chatsCount.textContent = this.currentUser.stats?.chats || 0
      if (onlineTime) onlineTime.textContent = `${this.currentUser.stats?.onlineTime || 0}h`

      modal.classList.add("active")
    }
  }

  showSettingsModal() {
    const modal = document.getElementById("settings-modal")
    if (modal) {
      modal.classList.add("active")
    }
  }

  showCreateRoomModal() {
    const modal = document.getElementById("room-modal")
    if (modal) {
      modal.classList.add("active")
    }
  }

  showPictureModal() {
    const modal = document.getElementById("picture-modal")
    if (modal) {
      modal.classList.add("active")
    }
  }

  switchSettingsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".settings-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName)
    })

    // Update panels
    document.querySelectorAll(".settings-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `${tabName}-settings`)
    })
  }

  switchPictureTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".picture-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName)
    })

    // Update panels
    document.querySelectorAll(".picture-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `${tabName}-tab`)
    })
  }

  savePictureSelection() {
    if (this.selectedProfilePic && this.currentUser) {
      this.currentUser.profilePic = this.selectedProfilePic

      // Update user in storage
      const savedUsers = JSON.parse(localStorage.getItem("shadowtalk_registered_users") || "{}")
      const userKey = this.currentUser.username.toLowerCase()
      savedUsers[userKey] = this.currentUser
      localStorage.setItem("shadowtalk_registered_users", JSON.stringify(savedUsers))

      this.updateAllProfilePictures()
      this.saveData()

      document.getElementById("picture-modal")?.classList.remove("active")
    }
  }

  saveProfileChanges() {
    if (!this.currentUser) return

    const displayName = document.getElementById("profile-display-name")?.value.trim()
    const status = document.getElementById("profile-status")?.value.trim()

    this.currentUser.displayName = displayName
    this.currentUser.status = status

    // Update user in storage
    const savedUsers = JSON.parse(localStorage.getItem("shadowtalk_registered_users") || "{}")
    const userKey = this.currentUser.username.toLowerCase()
    savedUsers[userKey] = this.currentUser
    localStorage.setItem("shadowtalk_registered_users", JSON.stringify(savedUsers))

    this.updateUserInterface()
    this.saveData()

    document.getElementById("profile-modal")?.classList.remove("active")
  }

  createPost() {
    const input = document.getElementById("post-input")
    if (!input || !this.currentUser) return

    const content = input.value.trim()
    if (!content) return

    const post = {
      id: `post_${Date.now()}`,
      author: this.currentUser.username,
      displayName: this.currentUser.displayName,
      profilePic: this.currentUser.profilePic,
      content,
      timestamp: new Date().toISOString(),
    }

    this.posts.unshift(post)
    input.value = ""

    // Update stats
    if (this.currentUser.stats) {
      this.currentUser.stats.posts++
    }

    // Reset character counter
    const charCounter = document.getElementById("char-counter")
    const postBtn = document.getElementById("post-btn")

    if (charCounter) {
      charCounter.textContent = "300"
      charCounter.className = "char-count"
    }

    if (postBtn) postBtn.disabled = true

    this.renderPosts()
    this.saveData()
  }

  createRoom() {
    const nameInput = document.getElementById("room-name-input")
    const descriptionInput = document.getElementById("room-description")
    const modal = document.getElementById("room-modal")

    if (!nameInput || !modal) return

    const name = nameInput.value.trim() || `Room ${this.rooms.size + 1}`
    const description = descriptionInput?.value.trim() || ""

    const roomId = `room_${Date.now()}`
    const room = {
      id: roomId,
      name,
      description,
      members: 1,
      createdAt: new Date().toISOString(),
      messages: [],
    }

    this.rooms.set(roomId, room)
    nameInput.value = ""
    if (descriptionInput) descriptionInput.value = ""
    modal.classList.remove("active")

    this.renderRooms()
    this.saveData()

    // Auto-open the room
    this.openGroupRoom(roomId)
  }

  refreshFeed() {
    const refreshBtn = document.getElementById("refresh-feed-btn")
    if (refreshBtn) {
      refreshBtn.style.transform = "rotate(360deg)"

      setTimeout(() => {
        this.renderPosts()
        refreshBtn.style.transform = ""
      }, 500)
    }
  }

  showWelcomeMessage() {
    if (!this.currentUser) return

    const welcomePost = {
      id: `post_welcome_${Date.now()}`,
      author: "System",
      displayName: "System",
      content: `Welcome ${this.currentUser.displayName || this.currentUser.username}! 🎉

Your account is now set up and ready to use. Share this page with friends to start chatting, create group rooms, and enjoy secure anonymous conversations.`,
      timestamp: new Date().toISOString(),
      isSystem: true,
    }

    this.posts.unshift(welcomePost)
    this.renderPosts()
  }

  showWelcomeBackMessage() {
    if (!this.currentUser) return

    const welcomePost = {
      id: `post_welcome_back_${Date.now()}`,
      author: "System",
      displayName: "System",
      content: `Welcome back, ${this.currentUser.displayName || this.currentUser.username}! 👋

You're now online and ready to chat with friends.`,
      timestamp: new Date().toISOString(),
      isSystem: true,
    }

    this.posts.unshift(welcomePost)
    this.renderPosts()
  }

  renderPosts() {
    const container = document.getElementById("posts-feed")
    if (!container) return

    if (this.posts.length === 0) {
      container.innerHTML = `
        <div class="empty-feed">
          <h3>Welcome to ShadowTalk!</h3>
          <p>Share your first post or start chatting with friends</p>
        </div>
      `
      return
    }

    container.innerHTML = this.posts.map((post) => this.createPostHTML(post)).join("")

    // Add event listeners to post actions
    container.querySelectorAll('.post-action[data-action="chat"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const postItem = e.target.closest(".post-item")
        if (postItem) {
          const author = postItem.dataset.author
          if (author !== this.currentUser?.username && author !== "System") {
            this.openDirectMessage(author)
          }
        }
      })
    })
  }

  createPostHTML(post) {
    const timeAgo = this.getTimeAgo(post.timestamp)
    const isSystem = post.isSystem || post.author === "System"
    const canChat = !isSystem && post.author !== this.currentUser?.username

    return `
      <div class="post-item" data-author="${post.author}">
        <div class="post-header">
          <div class="post-author">
            <div class="post-avatar">
              ${this.renderProfilePic(post.profilePic, post.author)}
            </div>
            <div class="post-user-info">
              <div class="post-username">${post.author}</div>
              ${
                post.displayName && post.displayName !== post.author
                  ? `<div class="post-display-name">${post.displayName}</div>`
                  : ""
              }
            </div>
          </div>
          <div class="post-time">${timeAgo}</div>
        </div>
        <div class="post-content">${this.escapeHtml(post.content)}</div>
        <div class="post-actions">
          ${canChat ? `<button class="post-action" data-action="chat">💬 Chat</button>` : ""}
        </div>
      </div>
    `
  }

  renderProfilePic(profilePic, fallbackText) {
    if (profilePic) {
      if (profilePic.type === "upload") {
        return `<img src="${profilePic.data}" alt="Profile">`
      } else {
        return profilePic.data
      }
    }
    return this.getAvatarText(fallbackText)
  }

  getAvatarText(text) {
    if (text === "System") return "🤖"
    return text.charAt(0)
  }

  renderUsers() {
    const container = document.getElementById("users-container")
    if (!container) return

    const onlineUsers = Array.from(this.users.values()).filter(
      (user) => user.online && user.username !== this.currentUser?.username,
    )

    if (onlineUsers.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No friends online yet</p>
          <small>Share this page to connect!</small>
        </div>
      `
      return
    }

    container.innerHTML = onlineUsers
      .map(
        (user) => `
      <div class="user-item" data-username="${user.username}">
        <div class="user-info">
          <div class="user-avatar">
            ${this.renderProfilePic(user.profilePic, user.username)}
          </div>
          <div class="user-name">${user.displayName || user.username}</div>
        </div>
        <div class="user-status"></div>
      </div>
    `,
      )
      .join("")

    // Add click listeners
    container.querySelectorAll(".user-item").forEach((item) => {
      item.addEventListener("click", () => {
        const username = item.dataset.username
        if (username) this.openDirectMessage(username)
      })
    })
  }

  renderRooms() {
    const container = document.getElementById("rooms-container")
    if (!container) return

    const roomsArray = Array.from(this.rooms.values())

    if (roomsArray.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No rooms yet</p>
          <small>Create one to get started!</small>
        </div>
      `
      return
    }

    container.innerHTML = roomsArray
      .map(
        (room) => `
      <div class="room-item" data-room-id="${room.id}">
        <div class="room-info">
          <div class="room-avatar">👥</div>
          <div>
            <div class="room-name">${room.name}</div>
            <div class="room-count">${room.members} members</div>
          </div>
        </div>
      </div>
    `,
      )
      .join("")

    // Add click listeners
    container.querySelectorAll(".room-item").forEach((item) => {
      item.addEventListener("click", () => {
        const roomId = item.dataset.roomId
        if (roomId) this.openGroupRoom(roomId)
      })
    })
  }

  openDirectMessage(username) {
    const windowId = `dm_${username}`

    if (this.chatWindows.has(windowId)) {
      this.focusWindow(windowId)
      return
    }

    this.createChatWindow("dm", username, windowId)
  }

  openGroupRoom(roomId) {
    const windowId = `room_${roomId}`

    if (this.chatWindows.has(windowId)) {
      this.focusWindow(windowId)
      return
    }

    const room = this.rooms.get(roomId)
    if (room) {
      this.createChatWindow("room", room.name, windowId, roomId)
    }
  }

  createChatWindow(type, target, windowId, roomId = null) {
    const template = document.getElementById("chat-window-template")
    if (!template) return

    const windowElement = template.content.cloneNode(true)
    const chatWindow = windowElement.querySelector(".chat-window")

    if (!chatWindow) return

    // Set window properties
    chatWindow.dataset.windowId = windowId
    chatWindow.dataset.type = type
    chatWindow.dataset.target = target
    if (roomId) chatWindow.dataset.roomId = roomId

    // Configure window title
    const chatName = chatWindow.querySelector(".chat-name")
    const chatStatus = chatWindow.querySelector(".chat-status")

    if (chatName && chatStatus) {
      if (type === "dm") {
        chatName.textContent = target
        chatStatus.textContent = "Direct Message"
      } else {
        chatName.textContent = target
        chatStatus.textContent = "Group Room"
      }
    }

    // Position window
    const position = this.getNextWindowPosition()
    chatWindow.style.left = `${position.x}px`
    chatWindow.style.top = `${position.y}px`
    chatWindow.style.zIndex = ++this.windowZIndex

    // Add to DOM
    const chatWindowsContainer = document.getElementById("chat-windows")
    if (chatWindowsContainer) {
      chatWindowsContainer.appendChild(chatWindow)
    }

    // Store window data
    this.chatWindows.set(windowId, {
      element: chatWindow,
      type,
      target,
      roomId,
      minimized: false,
      maximized: false,
    })

    // Setup event listeners
    this.setupChatWindowListeners(chatWindow, windowId)

    // Load messages
    this.loadChatMessages(windowId)

    // Focus window
    this.focusWindow(windowId)

    // Update window tabs
    this.updateWindowTabs()

    // Update stats
    if (this.currentUser?.stats) {
      this.currentUser.stats.chats++
    }
  }

  setupChatWindowListeners(windowElement, windowId) {
    // Window controls
    const minimizeBtn = windowElement.querySelector(".minimize-btn")
    const maximizeBtn = windowElement.querySelector(".maximize-btn")
    const closeBtn = windowElement.querySelector(".close-btn")

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.toggleMinimizeWindow(windowId)
      })
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.toggleMaximizeWindow(windowId)
      })
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.closeWindow(windowId)
      })
    }

    // Message input
    const messageInput = windowElement.querySelector(".message-input")
    const sendBtn = windowElement.querySelector(".send-btn")
    const attachBtn = windowElement.querySelector(".attach-btn")

    if (sendBtn) {
      sendBtn.addEventListener("click", () => this.sendMessage(windowId))
    }

    if (messageInput) {
      messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.sendMessage(windowId)
      })

      // Typing indicator simulation
      messageInput.addEventListener("input", () => {
        this.showTypingIndicator(windowId)
      })
    }

    if (attachBtn) {
      attachBtn.addEventListener("click", () => {
        // Implement file attachment
        console.log("Attach file clicked")
      })
    }

    // Window focus
    windowElement.addEventListener("mousedown", () => this.focusWindow(windowId))
  }

  showTypingIndicator(windowId) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData) return

    const typingIndicator = windowData.element.querySelector(".typing-indicator")
    if (typingIndicator) {
      typingIndicator.style.display = "flex"

      // Hide after 2 seconds
      setTimeout(() => {
        typingIndicator.style.display = "none"
      }, 2000)
    }
  }

  getNextWindowPosition() {
    const windowCount = this.chatWindows.size
    const offset = windowCount * 30
    const baseX = 100 + offset
    const baseY = 100 + offset

    // Keep within viewport
    const maxX = window.innerWidth - 400
    const maxY = window.innerHeight - 500

    return {
      x: Math.min(baseX, maxX),
      y: Math.min(baseY, maxY),
    }
  }

  focusWindow(windowId) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData) return

    // Remove focus from all windows
    document.querySelectorAll(".chat-window").forEach((win) => {
      win.classList.remove("focused")
    })

    // Focus this window
    windowData.element.classList.add("focused")
    windowData.element.style.zIndex = ++this.windowZIndex
  }

  toggleMinimizeWindow(windowId) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData) return

    windowData.minimized = !windowData.minimized
    windowData.element.classList.toggle("minimized", windowData.minimized)

    const minimizeBtn = windowData.element.querySelector(".minimize-btn")
    if (minimizeBtn) {
      minimizeBtn.textContent = windowData.minimized ? "+" : "−"
    }
  }

  toggleMaximizeWindow(windowId) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData) return

    windowData.maximized = !windowData.maximized
    windowData.element.classList.toggle("maximized", windowData.maximized)

    const maximizeBtn = windowData.element.querySelector(".maximize-btn")
    if (maximizeBtn) {
      maximizeBtn.textContent = windowData.maximized ? "❐" : "□"
    }
  }

  closeWindow(windowId) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData) return

    // Animate out
    windowData.element.style.animation = "fadeOut 0.3s ease"

    setTimeout(() => {
      windowData.element.remove()
      this.chatWindows.delete(windowId)
      this.updateWindowTabs()
    }, 300)
  }

  minimizeAllWindows() {
    this.chatWindows.forEach((windowData, windowId) => {
      if (!windowData.minimized) {
        this.toggleMinimizeWindow(windowId)
      }
    })
  }

  closeAllWindows() {
    const windowIds = Array.from(this.chatWindows.keys())
    windowIds.forEach((windowId) => this.closeWindow(windowId))
  }

  tileWindows() {
    const windows = Array.from(this.chatWindows.values())
    if (windows.length === 0) return

    const containerWidth = window.innerWidth - 40
    const containerHeight = window.innerHeight - 40
    const cols = Math.ceil(Math.sqrt(windows.length))
    const rows = Math.ceil(windows.length / cols)
    const windowWidth = containerWidth / cols
    const windowHeight = containerHeight / rows

    windows.forEach((windowData, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = 20 + col * windowWidth
      const y = 20 + row * windowHeight

      // Remove maximized/minimized states
      windowData.element.classList.remove("maximized", "minimized")
      windowData.maximized = false
      windowData.minimized = false

      // Set position and size
      windowData.element.style.left = `${x}px`
      windowData.element.style.top = `${y}px`
      windowData.element.style.width = `${windowWidth - 10}px`
      windowData.element.style.height = `${windowHeight - 10}px`
    })
  }

  updateWindowTabs() {
    const container = document.getElementById("window-tabs")
    if (!container) return

    if (this.chatWindows.size === 0) {
      container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">None</span>'
      return
    }

    const tabs = Array.from(this.chatWindows.entries())
      .map(([windowId, windowData]) => {
        const displayName =
          windowData.target.length > 10 ? windowData.target.substring(0, 10) + "..." : windowData.target

        return `
          <div class="window-tab" data-window-id="${windowId}" title="${windowData.target}">
            <span>${windowData.type === "dm" ? "💬" : "👥"}</span>
            <span>${displayName}</span>
            <button class="close-tab">&times;</button>
          </div>
        `
      })
      .join("")

    container.innerHTML = tabs

    // Add event listeners to tabs
    container.querySelectorAll(".window-tab").forEach((tab) => {
      const windowId = tab.dataset.windowId

      tab.addEventListener("click", (e) => {
        if (!e.target.classList.contains("close-tab")) {
          this.focusWindow(windowId)
        }
      })

      const closeBtn = tab.querySelector(".close-tab")
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          this.closeWindow(windowId)
        })
      }
    })
  }

  loadChatMessages(windowId) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData) return

    const messagesContainer = windowData.element.querySelector(".messages-container")
    if (!messagesContainer) return

    messagesContainer.innerHTML = ""

    // Load messages from localStorage
    const chatKey = `chat_${windowData.type}_${windowData.target}`
    const messages = JSON.parse(localStorage.getItem(chatKey) || "[]")

    if (messages.length === 0) {
      // Add welcome message
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        sender: "System",
        content:
          windowData.type === "dm" ? `Started a conversation with ${windowData.target}` : `Joined ${windowData.target}`,
        timestamp: new Date().toISOString(),
        type: "system",
      }

      this.addChatMessage(windowId, welcomeMessage, false)
      messages.push(welcomeMessage)
      localStorage.setItem(chatKey, JSON.stringify(messages))
    } else {
      messages.forEach((message) => {
        this.addChatMessage(windowId, message, false)
      })
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  sendMessage(windowId) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData || !this.currentUser) return

    const messageInput = windowData.element.querySelector(".message-input")
    if (!messageInput) return

    const content = messageInput.value.trim()
    if (!content) return

    const message = {
      id: `msg_${Date.now()}`,
      sender: this.currentUser.username,
      displayName: this.currentUser.displayName,
      profilePic: this.currentUser.profilePic,
      content,
      timestamp: new Date().toISOString(),
      type: "user",
    }

    this.addChatMessage(windowId, message, true)
    messageInput.value = ""

    // Save message
    const chatKey = `chat_${windowData.type}_${windowData.target}`
    const messages = JSON.parse(localStorage.getItem(chatKey) || "[]")
    messages.push(message)
    localStorage.setItem(chatKey, JSON.stringify(messages))
  }

  addChatMessage(windowId, message, animate = true) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData) return

    const messagesContainer = windowData.element.querySelector(".messages-container")
    if (!messagesContainer) return

    const messageElement = document.createElement("div")

    const isOwn = message.sender === this.currentUser?.username
    const messageClass = message.type === "system" ? "system" : isOwn ? "sent" : "received"

    messageElement.className = `message ${messageClass}`

    if (animate) {
      messageElement.style.animation = "fadeInUp 0.3s ease"
    }

    if (message.type === "system") {
      messageElement.innerHTML = `
        <div class="message-content">${this.escapeHtml(message.content)}</div>
      `
    } else {
      messageElement.innerHTML = `
        <div class="message-info">${message.displayName || message.sender} • ${this.getTimeAgo(message.timestamp)}</div>
        <div class="message-content">${this.escapeHtml(message.content)}</div>
      `
    }

    messagesContainer.appendChild(messageElement)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Flash window if minimized and not own message
    if (windowData.minimized && !isOwn) {
      this.flashWindow(windowId)
    }
  }

  flashWindow(windowId) {
    const windowData = this.chatWindows.get(windowId)
    if (!windowData) return

    const header = windowData.element.querySelector(".chat-header")
    if (header) {
      header.style.animation = "pulse 0.5s ease 3"

      setTimeout(() => {
        header.style.animation = ""
      }, 1500)
    }
  }

  // Drag functionality
  handleMouseDown(e) {
    const chatWindow = e.target.closest(".chat-window")
    if (!chatWindow) return

    const header = e.target.closest(".chat-header")
    if (!header || e.target.closest(".chat-controls")) return

    this.dragState.isDragging = true
    this.dragState.element = chatWindow
    this.dragState.startX = e.clientX
    this.dragState.startY = e.clientY
    this.dragState.startLeft = Number.parseInt(chatWindow.style.left) || 0
    this.dragState.startTop = Number.parseInt(chatWindow.style.top) || 0

    chatWindow.style.cursor = "move"
    this.focusWindow(chatWindow.dataset.windowId)

    e.preventDefault()
  }

  handleMouseMove(e) {
    if (!this.dragState.isDragging) return

    const deltaX = e.clientX - this.dragState.startX
    const deltaY = e.clientY - this.dragState.startY
    const newLeft = this.dragState.startLeft + deltaX
    const newTop = this.dragState.startTop + deltaY

    // Keep window within viewport
    const maxLeft = window.innerWidth - 100
    const maxTop = window.innerHeight - 50

    const constrainedLeft = Math.max(0, Math.min(newLeft, maxLeft))
    const constrainedTop = Math.max(0, Math.min(newTop, maxTop))

    this.dragState.element.style.left = `${constrainedLeft}px`
    this.dragState.element.style.top = `${constrainedTop}px`
  }

  handleMouseUp(e) {
    if (!this.dragState.isDragging) return

    if (this.dragState.element) {
      this.dragState.element.style.cursor = ""
    }
    this.dragState.isDragging = false
    this.dragState.element = null
  }

  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          // Show success feedback
          const btn = event.target
          const originalText = btn.textContent
          btn.textContent = "✓"
          setTimeout(() => {
            btn.textContent = originalText
          }, 1000)
        })
        .catch(() => {
          this.fallbackCopyToClipboard(text)
        })
    } else {
      this.fallbackCopyToClipboard(text)
    }
  }

  fallbackCopyToClipboard(text) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
  }

  exportUserData() {
    if (!this.currentUser) return

    const userData = {
      user: this.currentUser,
      posts: this.posts.filter((post) => post.author === this.currentUser.username),
      chats: this.getChatHistory(),
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `shadowtalk-data-${this.currentUser.username}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  getChatHistory() {
    const chatHistory = {}
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("chat_"))

    keys.forEach((key) => {
      const messages = JSON.parse(localStorage.getItem(key) || "[]")
      chatHistory[key] = messages
    })

    return chatHistory
  }

  clearAllData() {
    if (
      confirm("Are you sure you want to clear all data? This will log you out and delete all local data permanently.")
    ) {
      localStorage.clear()
      location.reload()
    }
  }

  handlePostImageUpload(e) {
    const file = e.target.files[0]
    if (file) {
      // Handle post image upload
      console.log("Post image upload:", file.name)
      // You can implement image upload functionality here
    }
  }

  updateUI() {
    this.renderUsers()
    this.renderRooms()
    this.renderPosts()
    this.updateWindowTabs()
    this.updateOnlineCount()
  }

  getTimeAgo(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize the app
const shadowTalk = new ShadowTalkAuth()

// Make it globally accessible
window.shadowTalk = shadowTalk
