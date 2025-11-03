import { Routes } from '@angular/router';
import { DocumentsComponent } from './documents/documents.component';
import { HomepageComponent } from './homepage/homepage.component';
import { CreateAgentComponent } from './create-agent/create-agent.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'documents', component: DocumentsComponent },
    { path: 'create_Agent', component: CreateAgentComponent },
    { path: 'chat/agent/:agent_id', component: HomepageComponent },
    { path: 'chat/doc/:doc_id', component: HomepageComponent },
    { path: ':conversation_id', component: HomepageComponent },

];
