import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Document {
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  id: number;
  status: string;
  error_message: null | string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  @ViewChild('fileInput') fileInputRef!: ElementRef;

  triggerFileUpload(): void {
    this.fileInputRef.nativeElement.click();
  }

handleFileUpload(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    console.log('Selected file:', file);

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.http.post('/api/upload', formData).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        // Optionally refresh document list or give user feedback here
        this.fetchData(); // if you want to refresh after upload
      },
      error: (error) => {
        console.error('Upload failed:', error);
      }
    });
  }
}

triggerDocChat() {
  const docsArray = Array.from(this.selectedDocs.values());
  const docsString = docsArray.join('_');
  this.router.navigate([`/chat/doc/${docsString}`]);
}


  documents: Document[] = [];
  pollingSubscription?: Subscription;

  constructor(private http: HttpClient,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.fetchData();
  }
  ngOnDestroy(): void {
    this.stopPolling();
  }

  fetchData(): void {
    this.http.get<any>('/api/documents', {
  headers: {
    'Accept': 'application/json'
  }}).subscribe(
      (response) => {
        console.log('API response:', response);
        this.documents = response.documents
        this.documents.sort((a, b) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        this.checkAndStartPolling();
        // Do something with the response
      },
      (error) => {
        console.error('API error:', error);
      }
    );
  }
    checkAndStartPolling(): void {
    const anyInProgress = this.documents.some(doc => doc.status === 'in_progress');
    if (anyInProgress && !this.pollingSubscription) {
      this.startPolling();
    } else if (!anyInProgress) {
      this.stopPolling();
    }
  }

  startPolling(): void {
    this.pollingSubscription = interval(2000).subscribe(() => {
      console.log('Polling for document status update...');
      this.fetchData();
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
      console.log('Stopped polling.');
    }
  }

selectedDocs: Set<number> = new Set();

onCheckboxChange(event: any, docId: number) {
  if (event.target.checked) {
    this.selectedDocs.add(docId);
  } else {
    this.selectedDocs.delete(docId);
  }
  console.log('Selected Document IDs:', Array.from(this.selectedDocs));
}

isSelected(docId: number): boolean {
  return this.selectedDocs.has(docId);
}

toggleAll(event: any) {
  const checked = event.target.checked;

  if (checked) {
    this.documents.forEach(doc => this.selectedDocs.add(doc.id));
  } else {
    this.selectedDocs.clear();
  }
  console.log('Selected Document IDs:', Array.from(this.selectedDocs));
}

deletefile(doc_id:number):void{
  this.http.delete<any>(`/api/documents/${doc_id}`).subscribe(
      (response) => {
        console.log('API response:', response);
        this.fetchData();
      },
      (error) => {
        console.error('API error:', error);
      }
    );
}

}
