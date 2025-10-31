import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { User, AuthGroup, AuthPermission } from '@app/auth/models/user.models';
import { createMockAPIService, createMockGeneralService, createMockModalService } from '../../../test-helpers';
import { Banner } from '@app/core/models/api.models';
import { Link } from '@app/core/models/navigation.models';

describe('UserService', () => {
  let service: UserService;
  let mockAPIService: any;
  let mockGeneralService: any;
  let mockModalService: any;

  beforeEach(() => {
    mockAPIService = createMockAPIService();
    mockGeneralService = createMockGeneralService();
    mockModalService = createMockModalService();
    mockModalService.successfulResponseBanner = jasmine.createSpy('successfulResponseBanner');

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: APIService, useValue: mockAPIService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: ModalService, useValue: mockModalService }
      ]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should fetch users with default parameters', async () => {
      const mockUsers: User[] = [
        { id: 1, username: 'user1' } as User,
        { id: 2, username: 'user2' } as User
      ];
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext(mockUsers);
      });

      const result = await service.getUsers();
      
      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/users/',
        { is_active: 0, is_admin: 0 },
        jasmine.any(Function),
        jasmine.any(Function)
      );
      expect(result).toEqual(mockUsers);
    });

    it('should fetch active users', async () => {
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext([]);
      });

      await service.getUsers(1, 0);
      
      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/users/',
        { is_active: 1, is_admin: 0 },
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should fetch admin users', async () => {
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext([]);
      });

      await service.getUsers(0, 1);
      
      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/users/',
        { is_active: 0, is_admin: 1 },
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should return null on error', async () => {
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any, onError: any) => {
        onError('Error');
      });

      const result = await service.getUsers();
      expect(result).toBeNull();
    });
  });

  describe('saveUser', () => {
    it('should save user and show banner', () => {
      const mockUser = { id: 1, username: 'testuser' } as User;
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
        onNext({ retMessage: 'User saved successfully' });
      });

      service.saveUser(mockUser);

      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'user/save/',
        mockUser,
        jasmine.any(Function)
      );
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should call callback function if provided', () => {
      const mockUser = { id: 1, username: 'testuser' } as User;
      const callbackSpy = jasmine.createSpy('callback');
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
        onNext({ retMessage: 'Success' });
      });

      service.saveUser(mockUser, callbackSpy);

      expect(callbackSpy).toHaveBeenCalled();
    });
  });

  describe('getUserGroups', () => {
    it('should fetch user groups', () => {
      const onNext = jasmine.createSpy('onNext');
      
      service.getUserGroups('123', onNext);

      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/groups/',
        { user_id: '123' },
        onNext,
        undefined
      );
    });

    it('should handle error callback', () => {
      const onNext = jasmine.createSpy('onNext');
      const onError = jasmine.createSpy('onError');
      
      service.getUserGroups('123', onNext, onError);

      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/groups/',
        { user_id: '123' },
        onNext,
        onError
      );
    });
  });

  describe('getGroups', () => {
    it('should fetch all groups', async () => {
      const mockGroups: AuthGroup[] = [
        { group_id: 1, name: 'Admin', id: 1, permissions: [] } as AuthGroup
      ];
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext(mockGroups);
      });

      const result = await service.getGroups();
      
      expect(result).toEqual(mockGroups);
    });

    it('should return null on error', async () => {
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any, onError: any) => {
        onError('Error');
      });

      const result = await service.getGroups();
      expect(result).toBeNull();
    });
  });

  describe('saveGroup', () => {
    it('should save group', () => {
      const mockGroup = { group_id: 1, name: 'Admins', id: 1, permissions: [] } as AuthGroup;
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
        onNext({ retMessage: 'Group saved' });
      });

      service.saveGroup(mockGroup);

      expect(mockAPIService.post).toHaveBeenCalled();
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });
  });

  describe('deleteGroup', () => {
    it('should delete group', () => {
      mockAPIService.delete.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext({ retMessage: 'Group deleted' });
      });

      service.deleteGroup(1);

      expect(mockAPIService.delete).toHaveBeenCalledWith(
        true,
        'user/groups/',
        { group_id: 1 },
        jasmine.any(Function)
      );
      expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    });
  });

  describe('getUserPermissions', () => {
    it('should fetch user permissions', () => {
      const onNext = jasmine.createSpy('onNext');
      
      service.getUserPermissions('123', onNext);

      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/permissions/',
        { user_id: '123' },
        onNext,
        undefined
      );
    });

    it('should not call API if userId is empty', () => {
      const onNext = jasmine.createSpy('onNext');
      
      service.getUserPermissions('', onNext);

      expect(mockAPIService.get).not.toHaveBeenCalled();
    });
  });

  describe('getPermissions', () => {
    it('should fetch all permissions', async () => {
      const mockPermissions: AuthPermission[] = [
        { id: 1, name: 'view_users' } as AuthPermission
      ];
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext(mockPermissions);
      });

      const result = await service.getPermissions();
      
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('savePermission', () => {
    it('should save permission', () => {
      const mockPermission = { id: 1, name: 'edit_users' } as AuthPermission;
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
        onNext({ retMessage: 'Permission saved' });
      });

      service.savePermission(mockPermission);

      expect(mockAPIService.post).toHaveBeenCalled();
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });
  });

  describe('deletePermission', () => {
    it('should delete permission', () => {
      mockAPIService.delete.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext({ retMessage: 'Permission deleted' });
      });

      service.deletePermission(1);

      expect(mockAPIService.delete).toHaveBeenCalled();
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });
  });

  describe('runSecurityAudit', () => {
    it('should run security audit', () => {
      const onNext = jasmine.createSpy('onNext');
      
      service.runSecurityAudit(onNext);

      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/security-audit/',
        undefined,
        onNext
      );
    });
  });

  describe('getPhoneTypes', () => {
    it('should fetch phone types', async () => {
      const mockPhoneTypes = [{ id: 1, phone_type: 'Mobile', carrier: 'Verizon' }];
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext(mockPhoneTypes);
      });

      const result = await service.getPhoneTypes();
      
      expect(result).toEqual(mockPhoneTypes);
    });
  });

  describe('getLinks', () => {
    it('should fetch links', async () => {
      const mockLinks: Link[] = [
        new Link('Home', '/')
      ];
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext(mockLinks);
      });

      const result = await service.getLinks();
      
      expect(result).toEqual(mockLinks);
    });
  });

  describe('saveLink', () => {
    it('should save link', () => {
      const mockLink = new Link('Home', '/');
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
        onNext({ retMessage: 'Link saved' });
      });

      service.saveLink(mockLink);

      expect(mockAPIService.post).toHaveBeenCalled();
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });
  });

  describe('deleteLink', () => {
    it('should delete link', () => {
      mockAPIService.delete.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext({ retMessage: 'Link deleted' });
      });

      service.deleteLink(1);

      expect(mockAPIService.delete).toHaveBeenCalled();
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });
  });

  describe('compareUserObjects', () => {
    it('should return true for same user IDs', () => {
      const user1 = { id: 1 } as User;
      const user2 = { id: 1 } as User;

      expect(service.compareUserObjects(user1, user2)).toBe(true);
    });

    it('should return false for different user IDs', () => {
      const user1 = { id: 1 } as User;
      const user2 = { id: 2 } as User;

      expect(service.compareUserObjects(user1, user2)).toBe(false);
    });

    it('should return false if user1 is null', () => {
      const user2 = { id: 1 } as User;

      expect(service.compareUserObjects(null as any, user2)).toBe(false);
    });

    it('should return false if user2 is null', () => {
      const user1 = { id: 1 } as User;

      expect(service.compareUserObjects(user1, null as any)).toBe(false);
    });

    it('should return false if both users lack IDs', () => {
      const user1 = { username: 'user1' } as User;
      const user2 = { username: 'user2' } as User;

      expect(service.compareUserObjects(user1, user2)).toBe(false);
    });
  });
});
