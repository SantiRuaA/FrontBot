import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.ensureContainerExists();
    }
  }

  private ensureContainerExists(): void {
    if (document.getElementById('notification-container')) {
      return;
    }
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  show(message: string, type: 'is-success' | 'is-danger' = 'is-success'): void {
    if (!this.isBrowser) {
      return;
    }

    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type} is-light animate__animated animate__fadeInRight`;
    notification.textContent = message;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    deleteButton.onclick = () => notification.remove();
    notification.appendChild(deleteButton);
    
    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
      notification.addEventListener('animationend', () => {
        notification.remove();
      });
    }, 4000);
  }
}