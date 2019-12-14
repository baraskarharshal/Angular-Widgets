import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { ModuleAttributeContentService } from '../../module-attribute-content.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'site-tools-user-group',
  templateUrl: './user-group.component.html',
  styleUrls: ['./user-group.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserGroupComponent implements OnInit {

  @Input()
  inputType: string;

  @Input()
  required?: boolean;

  @Input()
  attr?: string;

  @Output()
  owner?: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  group?: EventEmitter<number> = new EventEmitter<number>();

  pageNo = 1;
  pageSize = 10;
  userGroupForm: FormGroup;

  public searchOwner$ = new Subject<string | null>();
  public searchOwnerGroup$ = new Subject<string | null>();
  searchTerm: string;
  ownersList: any[];
  ownerGroupList: any[];

  constructor(private moduleAttributeContentService: ModuleAttributeContentService, ) {
    this.searchOwner$.subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.onSearch(searchTerm, 'owner');
    });

    this.searchOwnerGroup$.subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.onSearch(searchTerm, 'group');
    });
  }

  ngOnInit() {

    if(this.required){
      this.userGroupForm = new FormGroup({
        docOwner: new FormControl('', [Validators.required]),
        docOwnerGroup: new FormControl('', [Validators.required])
      });
    } else {
      this.userGroupForm = new FormGroup({
        docOwner: new FormControl(''),
        docOwnerGroup: new FormControl('')
      });
    }
    

    if (this.attr && this.attr['value'] && this.inputType === 'owner') {
      this.f.docOwner.setValue(this.attr['value']);
    } else if (this.attr && this.attr['value'] && this.inputType === 'group') {
      this.f.docOwnerGroup.setValue(this.attr['value']);
    }

    this.loadOwners(1);
    this.loadOwnersGroup(1);

  }

  get f() {
    return this.userGroupForm.controls;
  }

  onChangeOwner() {
    if (this.attr) {
      this.attr['value'] = this.f.docOwner.value;
    }
    this.owner.emit(this.f.docOwner.value);
  }

  onChangeOwnerGroup() {
    if (this.attr) {
      this.attr['value'] = this.f.docOwnerGroup.value;
    }
    this.group.emit(this.f.docOwnerGroup.value);
  }


  onScrollOwners(event) {
    if (this.searchTerm.length > 0) {
      return;
    }
    if (event.end+1 >= this.ownersList.length
      && this.pageNo <= this.moduleAttributeContentService.ownerPageCount) {
      this.loadOwners(this.pageNo);
    }
  }

  loadOwners(pageNo) {
    if (pageNo === 1) {
      this.searchTerm = "";
      this.ownersList = [];
      if(this.attr){
        this.setCurrentOwner(this.attr);
      }
    }
    this.pageNo = pageNo;
    this.ownersList = [...this.ownersList, ...this.moduleAttributeContentService.getOwners(this.pageNo)];
    this.pageNo++;
  }

  onScrollOwnerGroup(event) {
    if (this.searchTerm.length > 0) {
      return;
    }
    if (event.end+1 >= this.ownerGroupList.length
      && this.pageNo <= this.moduleAttributeContentService.ownerGroupPageCount) {
      this.loadOwnersGroup(this.pageNo);
    }
  }

  loadOwnersGroup(pageNo) {
    if (pageNo === 1) {
      this.searchTerm = "";
      this.ownerGroupList = [];
      if(this.attr){
        this.setCurrentOwner(this.attr);
      }
    }
    this.pageNo = pageNo;
    this.ownerGroupList = [...this.ownerGroupList, ...this.moduleAttributeContentService.getOwnerGroups(this.pageNo)];
    this.pageNo++;
  }

  setCurrentOwner(panelAttr: any) {
    if (panelAttr.value) {
      if (this.inputType === "group") {
        let currentOwner = this.moduleAttributeContentService.ownerGroups.find(item => item.userGroupId === panelAttr.value);
        if (currentOwner) {
          this.ownerGroupList = [currentOwner];
        }
      } else if (this.inputType === "owner") {
        let currentOwner = this.moduleAttributeContentService.owners.find(item => item.userGroupId === panelAttr.value);
        if (currentOwner) {
          this.ownersList = [currentOwner];
        }
      }
    }
  }

  onSearch(searchTerm, type) {
    if (searchTerm && searchTerm.length > 0) {
      if (type === 'owner') {
        this.ownersList = this.moduleAttributeContentService.owners.filter(item => item.name.toLowerCase().startsWith(searchTerm.toLowerCase())).slice(0, 50);
      } else {
        this.ownerGroupList = this.moduleAttributeContentService.ownerGroups.filter(item => item.name.toLowerCase().startsWith(searchTerm.toLowerCase())).slice(0, 50);
      }
    }
  }

  checkSearchOwnerTerm(e) {
    if (e && e.code === 'Backspace' && this.searchTerm.length === 1) {
      this.loadOwners(1);
    }
  }

  checkSearchOwnerGroupTerm(e) {
    if (e && e.code === 'Backspace' && this.searchTerm.length === 1) {
      this.loadOwnersGroup(1);
    }
  }

}
