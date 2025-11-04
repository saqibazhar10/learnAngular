import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';


interface Conversations {
  id: string;
  conv_title: string;
  created_at: string;
}

interface Agents {
  id: string;
  name: string;
  instructions:string;
  description:string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  ngOnInit(): void {
    this.fetchData();
    this.fetchAgents();
  }

  agents: Agents[]=[];
  conversations: Conversations[] = [];
  @Output() conversationIdChange = new EventEmitter<string>();

  constructor(private http: HttpClient,
    private router : Router
  ) { }

  fetchData(): void {
    this.http.get<any>('http://13.53.48.142:8000/all_conversations').subscribe(
      (response) => {
        console.log('API response:', response);
        this.conversations = response
        this.conversations.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      },
      (error) => {
        console.error('API error:', error);
      }
    );
  }
    fetchAgents(): void {
    this.http.get<any>('http://13.53.48.142:8000/all_agents').subscribe(
      (response) => {
        console.log('API response:', response);
        this.agents = response
      },
      (error) => {
        console.error('API error:', error);
      }
    );
  }
  reset_conv_id() {
    this.conversationIdChange.emit("");
  }
  del_all_Conv(): void {
    this.http.delete<any>('http://13.53.48.142:8000/del_all_conv').subscribe(
      (response) => {
        console.log('API response:', response);
        this.conversations = [];

      },
      (error) => {
        console.error('API error:', error);
      }
    );
  }


  goToConversation(convId: string) {
  this.router.navigate([`/${convId}`]);
}
  goToAgentConversation(agentId:String){
    this.router.navigate([`/chat/agent/${agentId}`]);
  }

}
