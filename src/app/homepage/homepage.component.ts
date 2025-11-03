import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActivatedRoute } from '@angular/router';


interface ChatMessage {
  conversation_id?: string;
  userMessage: string;
  userTimestamp: Date;
  llm_response?: string;
  llmTimestamp?: Date;
  loading?: boolean;
  conv_title?: string;
}

@Component({
  standalone: true,
  selector: 'app-homepage',
  imports: [CommonModule, HttpClientModule, MarkdownModule, RouterOutlet, RouterLink, NavbarComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  userMessage: string = "";
  apiResponse: any;
  showDiv: boolean = true;
  showDivCov: boolean = false;
  chatHistory: ChatMessage[] = [];

  conversation_id: string = "";
  doc_ids: number[] = [];
  agentId: any = ""


  constructor(private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  getUserMessage(event: Event) {
    this.userMessage = (event.target as HTMLInputElement).value;
  }
  onConversationIdChange(newId: string) {
    this.conversation_id = newId;
    console.log('Conversation ID updated from Navbar:', newId);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const convId = params.get('conversation_id');
      const docIdParam = params.get('doc_id');
      const agentIdParam = params.get('agent_id');
      if (convId) {
        this.conversation_id = convId;
        this.loadConversation(convId);
      }
      if (docIdParam) {
        const docIds = docIdParam.split('_').map(idStr => parseInt(idStr, 10)).filter(id => !isNaN(id));
        this.doc_ids = docIds;
      }
      if (agentIdParam != "") {
        this.agentId = agentIdParam;
      }
    });
  }



  submitMessage() {
    if (!this.userMessage.trim()) return;

    this.showDiv = false;
    this.showDivCov = true;

    const currentMessage = this.userMessage;
    const payload: any = {
      query: currentMessage,
      conversation_id: this.conversation_id,
      doc_id: this.doc_ids
    };

    if (this.conversation_id === "") {
      delete payload['conversation_id'];
    }
    if (this.doc_ids && this.doc_ids.length === 0) {
      delete payload["doc_id"]
    }


    this.userMessage = '';

    const newMessage: ChatMessage = {
      userMessage: currentMessage,
      userTimestamp: new Date(),
      loading: true
    };

    this.chatHistory.push(newMessage);
    let endpoint = '';

    if (this.doc_ids && this.doc_ids.length > 0) {
      endpoint = 'http://localhost:8000/doc_chat';
    } else if (this.agentId && this.agentId != "") {
      endpoint = 'http://localhost:8000/free_chat'
    }else {
      endpoint = 'http://localhost:8000/free_chat';
    }

    this.http.post<any>(endpoint, payload).subscribe({
      next: (res) => {
        console.log(res.llm_response)
        newMessage.llm_response = res.llm_response;
        newMessage.llmTimestamp = new Date();
        newMessage.loading = false;
        newMessage.conv_title = res.conv_title;
        this.conversation_id = res.conversation_id;
      },
      error: (err) => {
        console.error('API error:', err);
        newMessage.llm_response = 'Error: Failed to get response.';
        newMessage.llmTimestamp = new Date();
        newMessage.loading = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // optional if you want to prevent form submission or newline
      this.submitMessage();
    }
  }

  loadConversation(convId: string) {
    this.http.get<any>(`http://localhost:8000/conversation/${convId}`).subscribe({
      next: (res) => {
        this.chatHistory = res.messages.map((msg: any) => ({
          conversation_id: res.conversation_id,
          conv_title: res.conv_title,
          userMessage: msg.user_message,
          userTimestamp: new Date(msg.timestamp),
          llm_response: msg.llm_response,
          llmTimestamp: new Date(msg.timestamp),
          loading: false
        }));

        this.conversation_id = res.conversation_id;
        this.doc_ids = res.doc_id;
        this.agentId = res.agentId;
        this.showDiv = false;
        this.showDivCov = true;
      },
      error: (err) => {
        console.error('Failed to load conversation', err);
      }
    });
  }


}
