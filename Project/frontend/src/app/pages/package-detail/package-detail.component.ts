import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FlowDetailsComponent } from '../flow-details/flow-details.component';
import { saveAs } from 'file-saver';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { PackageDetailService, PackageDetails, FlowElement } from '../../services/package-detail.service';
import {TranslateModule} from "@ngx-translate/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GithubDialogComponent} from "../github-dialog/github-dialog.component";

@Component({
  selector: 'app-package-detail',
  standalone: true,
  templateUrl: './package-detail.component.html',
  imports: [
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatButtonModule,
    TranslateModule
  ],
  styleUrls: ['./package-detail.component.scss'],
})
export class PackageDetailComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  packageId: string = '';
  dataSource: MatTableDataSource<FlowElement>;
  displayedColumns: string[] = ['position', 'name', 'version', 'modifiedBy', 'modifiedDate', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  packageDetails: PackageDetails = {
    createdBy: '',
    creationDate: '',
    description: '',
    id: '',
    mode: '',
    modifiedBy: '',
    modifiedDate: '',
    name: '',
    partnerContent: false,
    resourceId: '',
    shortText: '',
    supportedPlatform: '',
    updateAvailable: false,
    vendor: '',
    version: '',
  };

  constructor(
    private route: ActivatedRoute,
    private packageDetailService: PackageDetailService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<FlowElement>();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.packageId = params['id'];
      this.fetchPackageDetails();
      this.fetchPackageFlows();
    });
  }

  fetchPackageDetails() {
    this.packageDetailService.getPackageDetails(this.packageId).subscribe(
      (packageDetails) => {
        this.packageDetails = packageDetails;
        console.log(packageDetails);
      },
      (error) => {
        console.error('Error fetching package details:', error);
      }
    );
  }

  fetchPackageFlows() {
    this.packageDetailService.getPackageFlows(this.packageId).subscribe(
      (flows) => {
        this.dataSource.data = flows;
        this.dataSource.paginator = this.paginator;
        console.log(flows);
      },
      (error) => {
        console.error('Error fetching package flows:', error);
      }
    );
  }

  openFlow(element: FlowElement) {
    const dialogRef = this.dialog.open(FlowDetailsComponent, {
      data: {
        name: element.name,
        version: element.version,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  downloadFlow(element: FlowElement) {
    this.packageDetailService.downloadFlow(element.name, element.version).subscribe(
      (response) => {
        saveAs(response, `${element.name}_${element.version}.xml`);
        this.showSuccessToast(`${element.name}_${element.version}.xml downloaded successfully`);
      },
      (error) => {
        console.error('Error downloading flow:', error);
      }
    );
  }

  enableJenkins(element: FlowElement) {
    let path = "C:\\Users\\rodri\\IdeaProjects\\PI-CPIGovernanceAuto\\Project\\backend\\file.xml";
    this.packageDetailService.enableJenkins(element.name, path).subscribe(
      (response) => {
        console.log('Jenkins enabled successfully:', response);
        this.showSuccessToast('Jenkins enabled successfully');
      },
      (error) => {
        console.error('Error enabling Jenkins for the flow:', error);
      }
    );
  }

  openGithub(element: FlowElement) {
    const dialogRef = this.dialog.open(GithubDialogComponent, {
      data: {
        flowElement: element, // Pass the flow element directly
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The GitHub dialog was closed');
    });
  }

  /*

    enableGithub(element: FlowElement) {
      this.packageDetailService.enableGithub(element.name, element.version).subscribe(
        (response) => {
          console.log('Github enabled successfully');
          this.showSuccessToast('Github enabled successfully');
        },
        (error) => {
          console.error('Error enabling Github for the flow:', error);
        }
      );
    }

   */

  goBack() {
    this.router.navigate(['/packages']);
  }

  showSuccessToast(message: string): void {
    this.snackBar
      .open(message, 'Close', {
        duration: 5000,
        panelClass: 'success-toast',
      })
      .onAction()
      .subscribe(() => this.snackBar.dismiss());
  }
}
