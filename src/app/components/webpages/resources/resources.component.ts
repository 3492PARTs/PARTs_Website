import { Component, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../atoms/button-ribbon/button-ribbon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resources',
  imports: [BoxComponent, ButtonComponent, ButtonRibbonComponent, CommonModule],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {

  resources = [
    { title: 'PARTs 3492 Wiki', icon: 'bookshelf', rotate: '0deg', description: 'This is the team wiki where you will find information and training that we have written over the years.', link: 'https://wiki.parts3492.org' },
    { title: 'PARTs 3492 GitHub Repository', icon: 'source-branch', rotate: '0deg', description: 'This is where you can look at the code we have created for our robots and other various projects over the years.', link: 'https://github.com/3492PARTs' },
    { title: 'Chief Delphi', icon: 'forum', rotate: '0deg', description: 'Forums and discussions created by FRC&reg; teams to talk about the FRC&reg; game and robots. Great for answering any questions you may have.', link: 'https://www.chiefdelphi.com/' },
    { title: 'WPILib Docs', icon: 'book-open-page-variant', rotate: '0deg', description: 'The documentation on this site encompasses a number of helpful documents including control system manual and resources to help teams get started on programming a robot.', link: 'https://docs.wpilib.org' },
    {
      title: 'FRC&reg; 2025 Game Manual',
      icon: 'book',
      rotate: '0deg',
      description: 'Manual including all rules and regulations for the 2025 game, FIRST&reg; REEFSCAPE, as well as, field drawings and other documents. You can download any as a PDF for future reference.', link: 'https://firstfrc.blob.core.windows.net/frc2025/Manual/2025GameManual.pdf'
    },
    { title: 'The Blue Alliance (TBA)', icon: 'alarm-light-outline', rotate: '180deg', description: 'FIRST Robotics Competition team information, event results, and videos. Click <a target="_blank" href="http://www.thebluealliance.com/team/3492">here</a> for the Blue Alliance page for Team 3492.', link: 'http://www.thebluealliance.com/' },

  ]

  constructor() { }

  ngOnInit() {
  }

  openURL(url: string): void {
    window.open(url, 'noopener');
  }

}
