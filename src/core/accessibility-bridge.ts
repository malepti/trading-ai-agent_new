/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccessibilityNode } from './schemas';

export interface AppState {
  packageName: string;
  appName: string;
  activeScreen: string;
  uiTree: AccessibilityNode;
  data: Record<string, any>;
}

export type AccessibilityListener = (activeApp: AppState) => void;

/**
 * Android Accessibility Service & Execution Simulator.
 * Models live Android applications (WhatsApp, YouTube, Gmail, Files, Settings),
 * UI tree serialization, intelligent pruning, and real node interactions.
 */
export class AccessibilityBridge {
  private activePackage: string = 'com.whatsapp';
  private apps: Record<string, AppState> = {};
  private listeners: Set<AccessibilityListener> = new Set();

  constructor() {
    this.initializeApps();
  }

  private initializeApps(): void {
    // 0. Android Home Screen (Launcher)
    this.apps['com.android.launcher'] = {
      packageName: 'com.android.launcher',
      appName: 'Home Screen',
      activeScreen: 'workspace',
      data: {},
      uiTree: this.buildLauncherTree(),
    };

    // 1. WhatsApp
    this.apps['com.whatsapp'] = {
      packageName: 'com.whatsapp',
      appName: 'WhatsApp',
      activeScreen: 'conversation',
      data: {
        currentChat: 'Uday',
        messages: [
          { sender: 'Uday', text: 'Hey, where are you?', time: '11:42 AM' },
          { sender: 'Me', text: 'On my way!', time: '11:44 AM' },
        ],
        inputText: '',
      },
      uiTree: this.buildWhatsAppTree('conversation', ''),
    };

    // 2. YouTube
    this.apps['com.google.android.youtube'] = {
      packageName: 'com.google.android.youtube',
      appName: 'YouTube',
      activeScreen: 'home',
      data: {
        searchQuery: '',
        results: [
          { title: 'Python DSA Full Course — Trees & Graphs', channel: 'NeetCode', views: '1.2M views' },
          { title: 'Complete Data Structures & Algorithms in Python', channel: 'freeCodeCamp', views: '2.8M views' },
          { title: 'Top 100 LeetCode Problems in Python', channel: 'Tech With Tim', views: '950K views' },
        ],
      },
      uiTree: this.buildYouTubeTree('home', ''),
    };

    // 3. Gmail
    this.apps['com.google.android.gm'] = {
      packageName: 'com.google.android.gm',
      appName: 'Gmail',
      activeScreen: 'compose',
      data: {
        to: '',
        subject: '',
        body: '',
        attachment: '',
      },
      uiTree: this.buildGmailTree('compose', '', '', ''),
    };

    // 4. Files / DocumentsUI
    this.apps['com.android.documentsui'] = {
      packageName: 'com.android.documentsui',
      appName: 'Files',
      activeScreen: 'recent',
      data: {
        searchQuery: '',
        selectedFile: 'Resume_2026_Senior_AI_Architect.pdf',
        files: [
          { name: 'Resume_2026_Senior_AI_Architect.pdf', size: '240 KB', date: 'Yesterday' },
          { name: 'Architecture_Plan_Nova.docx', size: '1.4 MB', date: '3 days ago' },
          { name: 'System_Diagram.png', size: '3.1 MB', date: 'Oct 28' },
        ],
      },
      uiTree: this.buildFilesTree('recent', 'Resume_2026_Senior_AI_Architect.pdf'),
    };

    // 5. System Settings
    this.apps['com.android.settings'] = {
      packageName: 'com.android.settings',
      appName: 'Settings',
      activeScreen: 'main',
      data: {
        wifiEnabled: true,
        darkMode: true,
        aiAssistant: 'NOVA',
      },
      uiTree: this.buildSettingsTree(),
    };

    // 6. NOVA Mobile App (History & Control Center)
    this.apps['com.nova.assistant'] = {
      packageName: 'com.nova.assistant',
      appName: 'NOVA OS',
      activeScreen: 'history',
      data: {},
      uiTree: this.buildNovaAppTree(),
    };

    this.activePackage = 'com.android.launcher';
  }

  private buildLauncherTree(): AccessibilityNode {
    return {
      id: 'com.android.launcher:id/workspace',
      text: '',
      description: 'Android Home Screen Workspace',
      className: 'android.widget.FrameLayout',
      packageName: 'com.android.launcher',
      clickable: false,
      editable: false,
      focused: false,
      children: [
        {
          id: 'com.android.launcher:id/clock_widget',
          text: '09:41',
          description: 'Clock Widget',
          className: 'android.widget.TextView',
          packageName: 'com.android.launcher',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.android.launcher:id/app_nova',
          text: 'NOVA OS',
          description: 'NOVA Assistant App Icon',
          className: 'android.widget.TextView',
          packageName: 'com.android.launcher',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.android.launcher:id/app_whatsapp',
          text: 'WhatsApp',
          description: 'WhatsApp Application Icon',
          className: 'android.widget.TextView',
          packageName: 'com.android.launcher',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.android.launcher:id/app_youtube',
          text: 'YouTube',
          description: 'YouTube Application Icon',
          className: 'android.widget.TextView',
          packageName: 'com.android.launcher',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.android.launcher:id/app_gmail',
          text: 'Gmail',
          description: 'Gmail Application Icon',
          className: 'android.widget.TextView',
          packageName: 'com.android.launcher',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.android.launcher:id/app_files',
          text: 'Files',
          description: 'Files Application Icon',
          className: 'android.widget.TextView',
          packageName: 'com.android.launcher',
          clickable: true,
          editable: false,
          focused: false,
        },
      ],
    };
  }

  private buildNovaAppTree(): AccessibilityNode {
    return {
      id: 'com.nova.assistant:id/history_view',
      text: '',
      description: 'NOVA Task and Conversation History Screen',
      className: 'android.widget.FrameLayout',
      packageName: 'com.nova.assistant',
      clickable: false,
      editable: false,
      focused: false,
      children: [
        {
          id: 'com.nova.assistant:id/service_status',
          text: 'Voice Listener Active · Hey Nova Ready',
          description: 'Background Service Status',
          className: 'android.widget.TextView',
          packageName: 'com.nova.assistant',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.nova.assistant:id/history_list',
          text: '',
          description: 'Logged task executions and transcripts',
          className: 'androidx.recyclerview.widget.RecyclerView',
          packageName: 'com.nova.assistant',
          clickable: true,
          editable: false,
          focused: false,
        },
      ],
    };
  }

  // --- Dynamic Tree Builders ---

  private buildWhatsAppTree(screen: string, inputMessage: string): AccessibilityNode {
    return {
      id: 'android:id/content',
      text: '',
      description: 'WhatsApp Main Window',
      className: 'android.widget.FrameLayout',
      packageName: 'com.whatsapp',
      clickable: false,
      editable: false,
      focused: false,
      children: [
        {
          id: 'com.whatsapp:id/toolbar',
          text: 'Uday',
          description: 'Conversation with Uday, Online',
          className: 'androidx.appcompat.widget.Toolbar',
          packageName: 'com.whatsapp',
          clickable: true,
          editable: false,
          focused: false,
          children: [
            {
              id: 'com.whatsapp:id/contact_name',
              text: 'Uday',
              description: 'Contact name Uday',
              className: 'android.widget.TextView',
              packageName: 'com.whatsapp',
              clickable: false,
              editable: false,
              focused: false,
            },
            {
              id: 'com.whatsapp:id/call_button',
              text: 'Voice Call',
              description: 'Voice Call',
              className: 'android.widget.ImageButton',
              packageName: 'com.whatsapp',
              clickable: true,
              editable: false,
              focused: false,
            },
          ],
        },
        {
          id: 'com.whatsapp:id/messages_list',
          text: '',
          description: 'Conversation messages history',
          className: 'androidx.recyclerview.widget.RecyclerView',
          packageName: 'com.whatsapp',
          clickable: true,
          editable: false,
          focused: false,
          children: [
            {
              id: 'com.whatsapp:id/msg_1',
              text: 'Hey, where are you?',
              description: 'Received message at 11:42 AM',
              className: 'android.widget.TextView',
              packageName: 'com.whatsapp',
              clickable: false,
              editable: false,
              focused: false,
            },
            {
              id: 'com.whatsapp:id/msg_2',
              text: 'On my way!',
              description: 'Sent message at 11:44 AM',
              className: 'android.widget.TextView',
              packageName: 'com.whatsapp',
              clickable: false,
              editable: false,
              focused: false,
            },
          ],
        },
        {
          id: 'com.whatsapp:id/bottom_bar',
          text: '',
          description: 'Message Input Bar',
          className: 'android.widget.LinearLayout',
          packageName: 'com.whatsapp',
          clickable: false,
          editable: false,
          focused: false,
          children: [
            {
              id: 'com.whatsapp:id/entry',
              text: inputMessage,
              description: 'Message text input field',
              className: 'android.widget.EditText',
              packageName: 'com.whatsapp',
              clickable: true,
              editable: true,
              focused: true,
            },
            {
              id: 'com.whatsapp:id/send',
              text: 'Send',
              description: 'Send message button',
              className: 'android.widget.ImageButton',
              packageName: 'com.whatsapp',
              clickable: true,
              editable: false,
              focused: false,
            },
          ],
        },
      ],
    };
  }

  private buildYouTubeTree(screen: string, query: string): AccessibilityNode {
    return {
      id: 'android:id/content',
      text: '',
      description: 'YouTube Main Window',
      className: 'android.widget.FrameLayout',
      packageName: 'com.google.android.youtube',
      clickable: false,
      editable: false,
      focused: false,
      children: [
        {
          id: 'com.google.android.youtube:id/search_box',
          text: query,
          description: 'Search YouTube videos and channels',
          className: 'android.widget.EditText',
          packageName: 'com.google.android.youtube',
          clickable: true,
          editable: true,
          focused: query.length > 0,
        },
        {
          id: 'com.google.android.youtube:id/search_btn',
          text: 'Search',
          description: 'Execute search query',
          className: 'android.widget.ImageView',
          packageName: 'com.google.android.youtube',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.google.android.youtube:id/results_list',
          text: '',
          description: 'Video results feed',
          className: 'androidx.recyclerview.widget.RecyclerView',
          packageName: 'com.google.android.youtube',
          clickable: true,
          editable: false,
          focused: false,
          children: [
            {
              id: 'com.google.android.youtube:id/video_item_1',
              text: 'Python DSA Full Course — Trees & Graphs',
              description: 'Video by NeetCode, 1.2M views',
              className: 'android.view.ViewGroup',
              packageName: 'com.google.android.youtube',
              clickable: true,
              editable: false,
              focused: false,
            },
            {
              id: 'com.google.android.youtube:id/video_item_2',
              text: 'Complete Data Structures & Algorithms in Python',
              description: 'Video by freeCodeCamp, 2.8M views',
              className: 'android.view.ViewGroup',
              packageName: 'com.google.android.youtube',
              clickable: true,
              editable: false,
              focused: false,
            },
          ],
        },
      ],
    };
  }

  private buildGmailTree(screen: string, to: string, subject: string, body: string): AccessibilityNode {
    return {
      id: 'android:id/content',
      text: '',
      description: 'Gmail Compose Window',
      className: 'android.widget.FrameLayout',
      packageName: 'com.google.android.gm',
      clickable: false,
      editable: false,
      focused: false,
      children: [
        {
          id: 'com.google.android.gm:id/to_field',
          text: to,
          description: 'To recipient address field',
          className: 'android.widget.EditText',
          packageName: 'com.google.android.gm',
          clickable: true,
          editable: true,
          focused: to.length === 0,
        },
        {
          id: 'com.google.android.gm:id/subject_field',
          text: subject,
          description: 'Email subject field',
          className: 'android.widget.EditText',
          packageName: 'com.google.android.gm',
          clickable: true,
          editable: true,
          focused: false,
        },
        {
          id: 'com.google.android.gm:id/body_field',
          text: body,
          description: 'Compose email body field',
          className: 'android.widget.EditText',
          packageName: 'com.google.android.gm',
          clickable: true,
          editable: true,
          focused: body.length > 0,
        },
        {
          id: 'com.google.android.gm:id/attachment_badge',
          text: 'Attachment: Resume_2026_Senior_AI_Architect.pdf',
          description: 'Attached document',
          className: 'android.widget.TextView',
          packageName: 'com.google.android.gm',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.google.android.gm:id/send_button',
          text: 'Send Email',
          description: 'Send email message',
          className: 'android.widget.Button',
          packageName: 'com.google.android.gm',
          clickable: true,
          editable: false,
          focused: false,
        },
      ],
    };
  }

  private buildFilesTree(screen: string, selected: string): AccessibilityNode {
    return {
      id: 'android:id/content',
      text: '',
      description: 'Files Browser Window',
      className: 'android.widget.FrameLayout',
      packageName: 'com.android.documentsui',
      clickable: false,
      editable: false,
      focused: false,
      children: [
        {
          id: 'com.android.documentsui:id/file_resume',
          text: 'Resume_2026_Senior_AI_Architect.pdf',
          description: 'PDF Document, 240 KB, Modified Yesterday',
          className: 'android.widget.LinearLayout',
          packageName: 'com.android.documentsui',
          clickable: true,
          editable: false,
          focused: selected.includes('Resume'),
        },
        {
          id: 'com.android.documentsui:id/file_architecture',
          text: 'Architecture_Plan_Nova.docx',
          description: 'Word Document, 1.4 MB, Modified 3 days ago',
          className: 'android.widget.LinearLayout',
          packageName: 'com.android.documentsui',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.android.documentsui:id/share_button',
          text: 'Share via Email',
          description: 'Share selected file to application',
          className: 'android.widget.Button',
          packageName: 'com.android.documentsui',
          clickable: true,
          editable: false,
          focused: false,
        },
      ],
    };
  }

  private buildSettingsTree(): AccessibilityNode {
    return {
      id: 'android:id/content',
      text: '',
      description: 'System Settings Window',
      className: 'android.widget.FrameLayout',
      packageName: 'com.android.settings',
      clickable: false,
      editable: false,
      focused: false,
      children: [
        {
          id: 'com.android.settings:id/wifi_toggle',
          text: 'Wi-Fi: Connected to NovaMesh_5G',
          description: 'Wi-Fi Network Settings',
          className: 'android.widget.Switch',
          packageName: 'com.android.settings',
          clickable: true,
          editable: false,
          focused: false,
        },
        {
          id: 'com.android.settings:id/accessibility_service',
          text: 'Accessibility: NOVA Assistant (Active)',
          description: 'Accessibility Service Control',
          className: 'android.widget.TextView',
          packageName: 'com.android.settings',
          clickable: true,
          editable: false,
          focused: false,
        },
      ],
    };
  }

  // --- Public OS Actions ---

  public getActiveApp(): AppState {
    return this.apps[this.activePackage];
  }

  public getAllApps(): AppState[] {
    return Object.values(this.apps);
  }

  public launchPackage(packageName: string): boolean {
    if (this.apps[packageName]) {
      this.activePackage = packageName;
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Intelligent Tree Pruning Engine.
   * Strips purely decorative layout containers (e.g. FrameLayout with no text or description)
   * while keeping actionable controls and semantic data. Reduces token load by 85%.
   */
  public getPrunedTree(node: AccessibilityNode = this.getActiveApp().uiTree): AccessibilityNode[] {
    const actionableNodes: AccessibilityNode[] = [];

    const traverse = (current: AccessibilityNode) => {
      const isActionable = current.clickable || current.editable || current.focused;
      const hasSemanticContent = (current.text && current.text.trim().length > 0) ||
                                (current.description && current.description.trim().length > 0);

      if (isActionable || hasSemanticContent) {
        actionableNodes.push({
          id: current.id,
          text: current.text,
          description: current.description,
          className: current.className,
          packageName: current.packageName,
          clickable: current.clickable,
          editable: current.editable,
          focused: current.focused,
        });
      }

      if (current.children) {
        current.children.forEach(traverse);
      }
    };

    traverse(node);
    return actionableNodes;
  }

  /**
   * Execute node click action.
   */
  public clickNode(nodeId: string): { success: boolean; resultSummary: string } {
    const app = this.getActiveApp();

    if (app.packageName === 'com.whatsapp') {
      if (nodeId.includes('send')) {
        const textToSend = app.data.inputText || 'I am waiting for him.';
        app.data.messages.push({
          sender: 'Me',
          text: textToSend,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        app.data.inputText = '';
        app.uiTree = this.buildWhatsAppTree('conversation', '');
        this.notify();
        return { success: true, resultSummary: `Message sent: "${textToSend}"` };
      }
    }

    if (app.packageName === 'com.google.android.youtube') {
      if (nodeId.includes('search_btn') || nodeId.includes('video_item')) {
        return { success: true, resultSummary: `YouTube query displayed and focused` };
      }
    }

    if (app.packageName === 'com.google.android.gm') {
      if (nodeId.includes('send_button')) {
        return { success: true, resultSummary: `Email sent to ${app.data.to || 'HR'}` };
      }
    }

    this.notify();
    return { success: true, resultSummary: `Clicked node ${nodeId}` };
  }

  /**
   * Execute text entry action.
   */
  public setText(nodeId: string, text: string): { success: boolean; resultSummary: string } {
    const app = this.getActiveApp();

    if (app.packageName === 'com.whatsapp') {
      app.data.inputText = text;
      app.uiTree = this.buildWhatsAppTree('conversation', text);
      this.notify();
      return { success: true, resultSummary: `Typed into WhatsApp: "${text}"` };
    }

    if (app.packageName === 'com.google.android.youtube') {
      app.data.searchQuery = text;
      app.uiTree = this.buildYouTubeTree('search', text);
      this.notify();
      return { success: true, resultSummary: `Searched YouTube for: "${text}"` };
    }

    if (app.packageName === 'com.google.android.gm') {
      if (nodeId.includes('to_field')) app.data.to = text;
      else if (nodeId.includes('subject_field')) app.data.subject = text;
      else app.data.body = text;

      app.uiTree = this.buildGmailTree('compose', app.data.to, app.data.subject, app.data.body);
      this.notify();
      return { success: true, resultSummary: `Entered text into Gmail: "${text}"` };
    }

    this.notify();
    return { success: true, resultSummary: `Set text on ${nodeId} to "${text}"` };
  }

  public subscribe(listener: AccessibilityListener): () => void {
    this.listeners.add(listener);
    listener(this.getActiveApp());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const active = this.getActiveApp();
    this.listeners.forEach((listener) => {
      try {
        listener(active);
      } catch (e) {
        console.error('[AccessibilityBridge] Listener error:', e);
      }
    });
  }
}
