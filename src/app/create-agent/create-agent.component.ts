import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';


interface Agent {
  name: string;
  instructions: string;
  description: string;
  creativity: number
}
@Component({
  selector: 'app-create-agent',
  imports: [CommonModule, HttpClientModule, MarkdownModule, RouterOutlet, RouterLink, NavbarComponent, CommonModule , FormsModule],
  templateUrl: './create-agent.component.html',
  styleUrl: './create-agent.component.css'
})
export class CreateAgentComponent {
  agent: Agent = {
    name: '',
    description: '',
    instructions: '',
    creativity: 0.1,
  };
    constructor(private http: HttpClient,
  ) { }

   createAgent() {
    console.log('Creating agent with data:', this.agent);
    let endpoint = "/api/create_agent"
    this.http.post<any>(endpoint, this.agent).subscribe({
      next: (res) => {
        console.log(res.result)
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
   }

   

}
