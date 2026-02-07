"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { supabase, getCurrentUser } from "@/lib/supabase-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://portfolio-pilot-api.vercel.app";

interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: "olympiad" | "project" | "volunteering" | "other";
  date: string;
  file_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "olympiad" as Achievement["type"],
    date: "",
  });

  // Проверка авторизации и загрузка
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const user = await getCurrentUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setUserId(user.id);
    fetchAchievements(user.id);
  };

  // GET - получить все достижения пользователя
  const fetchAchievements = async (uid: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/achievements?userId=${uid}`);
      const data = await response.json();
      
      if (data.success) {
        setAchievements(data.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки достижений:", error);
      alert("Не удалось загрузить достижения");
    } finally {
      setLoading(false);
    }
  };

  // POST - создать новое достижение
  const handleCreate = async () => {
    if (!formData.title || !formData.type) {
      alert("Заполните название и тип достижения");
      return;
    }

    if (!userId) {
      alert("Ошибка: пользователь не авторизован");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/achievements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          date: formData.date || new Date().toISOString().split("T")[0],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAchievements([data.data, ...achievements]);
        resetForm();
        setIsAdding(false);
        alert("Достижение создано!");
      } else {
        alert("Ошибка: " + data.error);
      }
    } catch (error) {
      console.error("Ошибка создания:", error);
      alert("Не удалось создать достижение");
    }
  };

  // PATCH - обновить достижение
  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`${API_URL}/api/achievements/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          date: formData.date,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAchievements(
          achievements.map((a) => (a.id === editingId ? data.data : a))
        );
        resetForm();
        setEditingId(null);
        alert("Достижение обновлено!");
      } else {
        alert("Ошибка: " + data.error);
      }
    } catch (error) {
      console.error("Ошибка обновления:", error);
      alert("Не удалось обновить достижение");
    }
  };

  // DELETE - удалить достижение
  const handleDelete = async (id: string) => {
    if (!confirm("Точно удалить это достижение?")) return;

    try {
      const response = await fetch(`${API_URL}/api/achievements/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setAchievements(achievements.filter((a) => a.id !== id));
        alert("Достижение удалено");
      } else {
        alert("Ошибка: " + data.error);
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить достижение");
    }
  };

  // Выход
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Начать редактирование
  const startEdit = (achievement: Achievement) => {
    setFormData({
      title: achievement.title,
      description: achievement.description || "",
      type: achievement.type,
      date: achievement.date,
    });
    setEditingId(achievement.id);
    setIsAdding(true);
  };

  // Сбросить форму
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "olympiad",
      date: "",
    });
  };

  const typeLabels = {
    olympiad: "Олимпиада",
    project: "Проект",
    volunteering: "Волонтерство",
    other: "Другое",
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Мои достижения</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAdding(!isAdding)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить достижение
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingId ? "Редактировать достижение" : "Новое достижение"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="IOI Gold Medal 2025"
              />
            </div>

            <div>
              <Label htmlFor="type">Тип *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, type: e.target.value as Achievement["type"] })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="olympiad">Олимпиада</option>
                <option value="project">Проект</option>
                <option value="volunteering">Волонтерство</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Расскажите о вашем достижении..."
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1"
              >
                {editingId ? "Сохранить изменения" : "Создать"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {achievements.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              У вас пока нет достижений. Добавьте первое!
            </CardContent>
          </Card>
        ) : (
          achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">
                        {achievement.title}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {typeLabels[achievement.type]}
                      </span>
                      {achievement.verified && (
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                          Проверено
                        </span>
                      )}
                    </div>
                    {achievement.description && (
                      <p className="text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Дата: {achievement.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(achievement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(achievement.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}