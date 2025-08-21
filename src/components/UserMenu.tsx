import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  const { user, signOut, isAdmin } = useAuth();

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <User className="w-4 h-4 mr-2" />
          {user.email?.split('@')[0]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/newsletter" className="cursor-pointer">
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;